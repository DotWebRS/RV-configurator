import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  EXTMeshFeatures,
} from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const DEFAULT_TEXTURE_SIZE = 2048;
const MIN_TEXTURE_SIZE = 64;
const MAX_TEXTURE_SIZE = 16384;
const DEFAULT_ID_MASK_COLOR_COUNT = 8;
const MAX_ID_MASK_COLOR_COUNT = 255;
const ID_MASK_EXTENSION = "EXT_mesh_features";
const ID_MASK_LABEL = "rvPatternId";
const EXTERIOR_MATERIAL_PATTERN = /^exteri(?:or|oe)_0[1-9]\d*$/i;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const INPUT_DIR = path.join(PROJECT_ROOT, "model-optimization", "input");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "model-optimization", "output");

function getOptionValue(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return argument?.slice(prefix.length);
}

function getIntegerOption(name, defaultValue, minimum, maximum) {
  const value = getOptionValue(name);
  const requested = value === undefined || !/^\d+$/.test(value)
    ? (value === undefined ? defaultValue : Number.NaN)
    : Number.parseInt(value, 10);

  if (!Number.isInteger(requested) || requested < minimum || requested > maximum) {
    throw new Error(`--${name} mora biti ceo broj izmeÄ‘u ${minimum} i ${maximum}.`);
  }

  return requested;
}

function getOptions() {
  const args = new Set(process.argv.slice(2));
  const masksValue = getOptionValue("masks");

  if (args.has("--masks") && args.has("--no-masks")) {
    throw new Error("Koristi samo jednu opciju: --masks ili --no-masks.");
  }

  let createMasks = !args.has("--no-masks");
  if (args.has("--masks")) createMasks = true;

  if (masksValue !== undefined) {
    if (masksValue !== "true" && masksValue !== "false") {
      throw new Error("--masks prihvata samo true ili false.");
    }
    createMasks = masksValue === "true";
  }

  return {
    createMasks,
    textureSize: getIntegerOption("texture-size", DEFAULT_TEXTURE_SIZE, MIN_TEXTURE_SIZE, MAX_TEXTURE_SIZE),
    idMaskColorCount: getIntegerOption("id-colors", DEFAULT_ID_MASK_COLOR_COUNT, 1, MAX_ID_MASK_COLOR_COUNT),
  };
}

async function findGlbFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findGlbFiles(absolutePath));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".glb") {
      files.push(absolutePath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function getTextureSizeLabel(textureSize) {
  return textureSize % 1024 === 0
    ? `${textureSize / 1024}k`
    : `${textureSize}px`;
}

function getOutputPath(inputPath, textureSize) {
  const relativePath = path.relative(INPUT_DIR, inputPath);
  const parsedPath = path.parse(relativePath);
  const sizeSuffix = `optimized-${getTextureSizeLabel(textureSize)}`;
  const optimizedSuffixPattern = /optimized-(?:\d+k|\d+px)/i;
  const outputName = optimizedSuffixPattern.test(parsedPath.name)
    ? parsedPath.name.replace(optimizedSuffixPattern, sizeSuffix)
    : `${parsedPath.name}-${sizeSuffix}`;

  return path.join(OUTPUT_DIR, parsedPath.dir, `${outputName}.glb`);
}

function calculateSize(width, height, textureSize) {
  const scale = Math.min(textureSize / width, textureSize / height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function isProtectedLogoPixel(red, green, blue) {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);

  // Logos on the current Regent atlases are near-white neutral lettering.
  // ID 0 is reserved for these pixels, so the runtime never recolors them.
  return minimum >= 185 && maximum - minimum <= 28;
}

function quantizedColorKey(red, green, blue) {
  return `${red >> 3},${green >> 3},${blue >> 3}`;
}

function squaredColorDistance(colorA, colorB) {
  const red = colorA[0] - colorB[0];
  const green = colorA[1] - colorB[1];
  const blue = colorA[2] - colorB[2];

  return red * red + green * green + blue * blue;
}

function nearestColorIndex(color, colors) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < colors.length; index += 1) {
    const distance = squaredColorDistance(color, colors[index]);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  return nearestIndex;
}

function createGlobalPalette(images, requestedColorCount) {
  const histogram = new Map();

  for (const { data } of images) {
    for (let offset = 0; offset < data.length; offset += 4) {
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const alpha = data[offset + 3];

      if (alpha === 0 || isProtectedLogoPixel(red, green, blue)) continue;

      const key = quantizedColorKey(red, green, blue);
      const existing = histogram.get(key);

      if (existing) {
        existing.count += 1;
        existing.red += red;
        existing.green += green;
        existing.blue += blue;
      } else {
        histogram.set(key, {
          count: 1,
          red,
          green,
          blue,
        });
      }
    }
  }

  const colors = [...histogram.values()].map((entry) => ({
    color: [
      entry.red / entry.count,
      entry.green / entry.count,
      entry.blue / entry.count,
    ],
    count: entry.count,
  }));

  if (colors.length === 0) return [];

  const paletteSize = Math.min(requestedColorCount, colors.length);
  const first = colors.reduce((best, current) =>
    current.count > best.count ? current : best);
  const centroids = [[...first.color]];

  while (centroids.length < paletteSize) {
    let candidate = colors[0];
    let candidateScore = -1;

    for (const entry of colors) {
      const distance = Math.min(
        ...centroids.map((centroid) => squaredColorDistance(entry.color, centroid)),
      );
      const score = distance * Math.sqrt(entry.count);

      if (score > candidateScore) {
        candidate = entry;
        candidateScore = score;
      }
    }

    centroids.push([...candidate.color]);
  }

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const sums = centroids.map(() => [0, 0, 0, 0]);

    for (const entry of colors) {
      const index = nearestColorIndex(entry.color, centroids);
      sums[index][0] += entry.color[0] * entry.count;
      sums[index][1] += entry.color[1] * entry.count;
      sums[index][2] += entry.color[2] * entry.count;
      sums[index][3] += entry.count;
    }

    let changed = false;

    for (let index = 0; index < centroids.length; index += 1) {
      if (sums[index][3] === 0) continue;

      const next = [
        sums[index][0] / sums[index][3],
        sums[index][1] / sums[index][3],
        sums[index][2] / sums[index][3],
      ];

      if (squaredColorDistance(centroids[index], next) > 0.01) changed = true;
      centroids[index] = next;
    }

    if (!changed) break;
  }

  return centroids
    .map((color) => color.map((channel) => Math.round(channel)))
    .sort((colorA, colorB) => {
      const luminanceA = colorA[0] * 0.2126 + colorA[1] * 0.7152 + colorA[2] * 0.0722;
      const luminanceB = colorB[0] * 0.2126 + colorB[1] * 0.7152 + colorB[2] * 0.0722;
      return luminanceA - luminanceB
        || colorA[0] - colorB[0]
        || colorA[1] - colorB[1]
        || colorA[2] - colorB[2];
    });
}

function encodeFeatureId(featureId) {
  return [
    featureId & 255,
    (featureId >> 8) & 255,
    (featureId >> 16) & 255,
  ];
}

async function createIdMask(image, palette) {
  const mask = Buffer.alloc(image.info.width * image.info.height * 3);
  const pixelCounts = new Array(palette.length + 1).fill(0);

  for (
    let sourceOffset = 0, targetOffset = 0;
    sourceOffset < image.data.length;
    sourceOffset += 4, targetOffset += 3
  ) {
    const red = image.data[sourceOffset];
    const green = image.data[sourceOffset + 1];
    const blue = image.data[sourceOffset + 2];
    const alpha = image.data[sourceOffset + 3];
    const featureId = alpha === 0 || isProtectedLogoPixel(red, green, blue)
      ? 0
      : nearestColorIndex([red, green, blue], palette) + 1;
    const encoded = encodeFeatureId(featureId);

    mask[targetOffset] = encoded[0];
    mask[targetOffset + 1] = encoded[1];
    mask[targetOffset + 2] = encoded[2];
    pixelCounts[featureId] += 1;
  }

  return {
    image: await sharp(mask, {
      raw: {
        width: image.info.width,
        height: image.info.height,
        channels: 3,
      },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer(),
    pixelCounts,
  };
}

async function readRgbaTexture(texture) {
  const source = texture.getImage();

  if (!source) {
    throw new Error(`Tekstura "${texture.getName() || "unnamed"}" nema sliku.`);
  }

  return sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

async function addExteriorIdMasks(document, colorCount) {
  const root = document.getRoot();
  const exteriorMaterials = root.listMaterials()
    .filter((material) => EXTERIOR_MATERIAL_PATTERN.test(material.getName()));
  const textureImages = new Map();

  for (const material of exteriorMaterials) {
    const texture = material.getBaseColorTexture();
    if (texture && !textureImages.has(texture)) {
      textureImages.set(texture, await readRgbaTexture(texture));
    }
  }

  if (textureImages.size === 0) {
    return {
      exteriorMaterials: 0,
      masks: 0,
      palette: [],
      protectedPixels: 0,
    };
  }

  const palette = createGlobalPalette(
    [...textureImages.values()],
    colorCount,
  );
  const meshFeaturesExtension = document.createExtension(EXTMeshFeatures);
  meshFeaturesExtension.setRequired(false);
  const materialMasks = new Map();
  let protectedPixels = 0;

  for (const material of exteriorMaterials) {
    const baseColorTexture = material.getBaseColorTexture();
    if (!baseColorTexture) continue;

    let maskTexture = materialMasks.get(baseColorTexture);

    if (!maskTexture) {
      const result = await createIdMask(textureImages.get(baseColorTexture), palette);
      protectedPixels += result.pixelCounts[0];
      maskTexture = document
        .createTexture(`${material.getName()}__rv_pattern_id_mask`)
        .setMimeType("image/png")
        .setImage(result.image);
      materialMasks.set(baseColorTexture, maskTexture);
    }
  }

  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const material = primitive.getMaterial();
      const baseColorTexture = material?.getBaseColorTexture();
      const maskTexture = baseColorTexture
        ? materialMasks.get(baseColorTexture)
        : null;

      if (!maskTexture) continue;

      const featureTexture = meshFeaturesExtension
        .createFeatureIDTexture()
        .setChannels([0, 1, 2])
        .setTexture(maskTexture);
      const baseColorInfo = material.getBaseColorTextureInfo();
      const featureTextureInfo = featureTexture.getTextureInfo();

      if (baseColorInfo && featureTextureInfo) {
        featureTextureInfo
          .setTexCoord(baseColorInfo.getTexCoord())
          .setMagFilter(9728) // NEAREST
          .setMinFilter(9728) // NEAREST
          .setWrapS(baseColorInfo.getWrapS())
          .setWrapT(baseColorInfo.getWrapT());
      }

      const featureId = meshFeaturesExtension
        .createFeatureID()
        .setFeatureCount(palette.length + 1)
        .setNullFeatureID(0)
        .setLabel(ID_MASK_LABEL)
        .setTexture(featureTexture);
      const features = meshFeaturesExtension
        .createFeatures()
        .addFeatureID(featureId);

      primitive.setExtension(ID_MASK_EXTENSION, features);
    }
  }

  const extras = root.getExtras();
  root.setExtras({
    ...extras,
    rvPatternMasks: {
      version: 1,
      extension: ID_MASK_EXTENSION,
      label: ID_MASK_LABEL,
      nullFeatureId: 0,
      idEncoding: "R + G*256 + B*65536",
      palette: palette.map((sourceColor, index) => ({
        id: index + 1,
        sourceColor,
      })),
      protectedRule: {
        description: "Near-white neutral logo lettering",
        minimumChannel: 185,
        maximumChannelDelta: 28,
      },
    },
  });

  return {
    exteriorMaterials: exteriorMaterials.length,
    masks: materialMasks.size,
    palette,
    protectedPixels,
  };
}

function emptyMaskResult() {
  return {
    exteriorMaterials: 0,
    masks: 0,
    palette: [],
    protectedPixels: 0,
  };
}

async function optimizeModel(io, inputPath, options) {
  const document = await io.read(inputPath);
  const root = document.getRoot();
  const textures = root.listTextures();
  const inputTextureNames = new Map(
    textures.map((texture) => [texture, texture.getName()]),
  );

  let resizedTextures = 0;
  let skippedTextures = 0;

  for (const texture of textures) {
    const image = texture.getImage();

    if (!image) {
      skippedTextures += 1;
      continue;
    }

    const metadata = await sharp(image).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error(`Dimenzije teksture "${texture.getName() || "unnamed"}" nisu dostupne.`);
    }

    if (width <= options.textureSize && height <= options.textureSize) {
      skippedTextures += 1;
      continue;
    }

    const target = calculateSize(width, height, options.textureSize);
    const isIdMask = texture.getName().toLowerCase().includes("masked");
    const resizedImage = await sharp(image)
      .resize({
        width: target.width,
        height: target.height,
        fit: "fill",
        // RuÄno kreirane ID maske sadrÅ¾e diskretne vrednosti i ne smeju
        // dobiti interpolirane boje tokom smanjivanja.
        kernel: isIdMask ? sharp.kernel.nearest : sharp.kernel.lanczos3,
      })
      .toBuffer();

    texture.setImage(resizedImage);
    resizedTextures += 1;

    console.log(
      `  Smanjena: ${texture.getName() || "unnamed"} (${width}x${height} -> ${target.width}x${target.height})`,
    );
  }

  const idMasks = options.createMasks
    ? await addExteriorIdMasks(document, options.idMaskColorCount)
    : emptyMaskResult();

  // glTF-Transform ponekad normalizuje embedded image podatke tokom upisa.
  // Eksplicitno vraÄ‡amo svaki naziv koji je postojao u ulaznom modelu.
  for (const [texture, inputName] of inputTextureNames) {
    texture.setName(inputName);
  }

  const outputPath = getOutputPath(inputPath, options.textureSize);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await io.write(outputPath, document);

  return {
    outputPath,
    textures: textures.length,
    resizedTextures,
    skippedTextures,
    idMasks,
  };
}

async function main() {
  await mkdir(INPUT_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const glbFiles = await findGlbFiles(INPUT_DIR);
  const options = getOptions();
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
    });

  if (glbFiles.length === 0) {
    console.log(`Nema GLB fajlova u: ${INPUT_DIR}`);
    return;
  }

  let resizedTextures = 0;
  let skippedTextures = 0;
  let createdMasks = 0;
  let failedModels = 0;

  console.log(`Pronađeno GLB modela: ${glbFiles.length}`);
  console.log(
    `Texture size: ${options.textureSize}px; create masks: ${options.createMasks}; ID colors: ${options.idMaskColorCount}`,
  );

  for (const inputPath of glbFiles) {
    console.log(`\nModel: ${path.relative(INPUT_DIR, inputPath)}`);

    try {
      const result = await optimizeModel(io, inputPath, options);
      resizedTextures += result.resizedTextures;
      skippedTextures += result.skippedTextures;
      createdMasks += result.idMasks.masks;

      console.log(`  Tekstura: ${result.textures}`);
      console.log(`  Exterior ID maski: ${result.idMasks.masks}`);
      console.log(`  ID šara: ${result.idMasks.palette.length}`);
      console.log(
        `  Zaštićenih logo/transparentnih piksela: ${result.idMasks.protectedPixels}`,
      );
      console.log(
        `  Paleta: ${result.idMasks.palette
          .map((color, index) => `${index + 1}=rgb(${color.join(",")})`)
          .join("; ")}`,
      );
      console.log(`  Sačuvano: ${path.relative(PROJECT_ROOT, result.outputPath)}`);
    } catch (error) {
      failedModels += 1;
      console.error(`  Greška: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\nRezultat:");
  console.log(`  Modela: ${glbFiles.length - failedModels}/${glbFiles.length} uspešno`);
  console.log(`  Smanjenih tekstura: ${resizedTextures}`);
  console.log(`  Kreiranih exterior ID maski: ${createdMasks}`);
  console.log(`  Preskočenih tekstura (<= ${options.textureSize}px ili bez slike): ${skippedTextures}`);

  if (failedModels > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
