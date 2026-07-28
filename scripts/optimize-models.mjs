import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const MAX_TEXTURE_SIZE = 2048;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const INPUT_DIR = path.join(PROJECT_ROOT, "model-optimization", "input");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "model-optimization", "output");

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

function getOutputPath(inputPath) {
  const relativePath = path.relative(INPUT_DIR, inputPath);
  const parsedPath = path.parse(relativePath);

  return path.join(
    OUTPUT_DIR,
    parsedPath.dir,
    `${parsedPath.name}-optimized-2k.glb`,
  );
}

function calculateSize(width, height) {
  const scale = Math.min(MAX_TEXTURE_SIZE / width, MAX_TEXTURE_SIZE / height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function optimizeModel(io, inputPath) {
  const document = await io.read(inputPath);
  const root = document.getRoot();
  const baseColorTextures = new Set();

  for (const material of root.listMaterials()) {
    const texture = material.getBaseColorTexture();
    if (texture) baseColorTextures.add(texture);
  }

  let resizedTextures = 0;
  let skippedTextures = 0;

  for (const texture of baseColorTextures) {
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

    if (width <= MAX_TEXTURE_SIZE && height <= MAX_TEXTURE_SIZE) {
      skippedTextures += 1;
      continue;
    }

    const target = calculateSize(width, height);
    const resizedImage = await sharp(image)
      .resize({
        width: target.width,
        height: target.height,
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer();

    texture.setImage(resizedImage);
    resizedTextures += 1;

    console.log(
      `  Resized: ${texture.getName() || "unnamed"} (${width}x${height} -> ${target.width}x${target.height})`,
    );
  }

  const outputPath = getOutputPath(inputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await io.write(outputPath, document);

  return {
    outputPath,
    baseColorTextures: baseColorTextures.size,
    resizedTextures,
    skippedTextures,
  };
}

async function main() {
  await mkdir(INPUT_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const glbFiles = await findGlbFiles(INPUT_DIR);
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
  let failedModels = 0;

  console.log(`Pronađeno GLB modela: ${glbFiles.length}`);

  for (const inputPath of glbFiles) {
    console.log(`\nModel: ${path.relative(INPUT_DIR, inputPath)}`);

    try {
      const result = await optimizeModel(io, inputPath);
      resizedTextures += result.resizedTextures;
      skippedTextures += result.skippedTextures;

      console.log(`  Base Color tekstura: ${result.baseColorTextures}`);
      console.log(`  Sačuvano: ${path.relative(PROJECT_ROOT, result.outputPath)}`);
    } catch (error) {
      failedModels += 1;
      console.error(`  Greška: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\nRezultat:");
  console.log(`  Modela: ${glbFiles.length - failedModels}/${glbFiles.length} uspešno`);
  console.log(`  Smanjenih Base Color tekstura: ${resizedTextures}`);
  console.log(`  Preskočenih Base Color tekstura (<= 2048 px ili bez slike): ${skippedTextures}`);

  if (failedModels > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
