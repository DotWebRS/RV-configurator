import * as THREE from "three";

const MASK_NAME = "masked";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function toLinearColor(color) {
    return new THREE.Color().setStyle(color, THREE.SRGBColorSpace);
}

function parsePatternColors(mesh) {
    const value = mesh.userData?.rvPatternColors;

    if (!value) return [];

    try {
        const colors = typeof value === "string" ? JSON.parse(value) : value;

        return Object.entries(colors)
            .map(([id, color]) => ({ id: Number(id), color }))
            .filter(({ id, color }) => Number.isInteger(id) && id > 0 && HEX_COLOR.test(color));
    } catch (error) {
        console.warn(
            `TextureChanger: mesh "${mesh.name}" ima neispravan rvPatternColors JSON.`,
            error,
        );
        return [];
    }
}

function getMaterialMaskTextures(material) {
    const textures = new Set();

    for (const value of Object.values(material)) {
        if (value?.isTexture && value.name?.toLowerCase().includes(MASK_NAME)) {
            textures.add(value);
        }
    }

    return [...textures];
}

export default class TextureChanger {
    constructor(gltf, meshes, onColorsChange = () => {}) {
        this.gltf = gltf;
        this.meshes = meshes;
        this.onColorsChange = onColorsChange;
        this.destroyed = false;
        this.maskTextures = new Set();
        this.materialStates = new Map();
        this.compiledShaders = new Set();

        this.patterns = [];
    }

    async initialize() {
        if (this.destroyed) return false;

        const patternsById = new Map();
        const materialMasks = new Map();

        for (const mesh of this.meshes) {
            if (!mesh.material) continue;

            const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];
            const maskedMaterials = materials
                .map((material) => ({
                    material,
                    masks: material ? getMaterialMaskTextures(material) : [],
                }))
                .filter(({ masks }) => masks.length > 0);

            if (maskedMaterials.length === 0) continue;

            const meshPatterns = parsePatternColors(mesh);
            if (meshPatterns.length === 0) {
                console.warn(
                    `TextureChanger: mesh "${mesh.name}" ima masked teksturu, ali nema rvPatternColors.`,
                );
                continue;
            }

            for (const { id, color } of meshPatterns) {
                const normalizedColor = color.toLowerCase();
                const existing = patternsById.get(id);

                if (existing && existing.originalColor !== normalizedColor) {
                    console.warn(
                        `TextureChanger: ID ${id} ima razliÄite osnovne boje (${existing.originalColor} i ${normalizedColor}). Koristi se prva vrednost.`,
                    );
                    continue;
                }

                if (!existing) {
                    patternsById.set(id, {
                        id,
                        originalColor: normalizedColor,
                        color: normalizedColor,
                    });
                }
            }

            for (const { material, masks } of maskedMaterials) {
                if (masks.length > 1) {
                    console.warn(
                        `TextureChanger: materijal "${material.name}" sadrÅ¾i viÅ¡e masked tekstura. Koristi se prva.`,
                    );
                }

                const maskTexture = masks[0];
                maskTexture.colorSpace = THREE.NoColorSpace;
                maskTexture.magFilter = THREE.NearestFilter;
                maskTexture.minFilter = THREE.NearestFilter;
                maskTexture.generateMipmaps = false;
                maskTexture.needsUpdate = true;
                this.maskTextures.add(maskTexture);

                const existingMask = materialMasks.get(material);
                if (existingMask && existingMask !== maskTexture) {
                    console.warn(
                        `TextureChanger: materijal "${material.name}" koristi više ID maski.`,
                    );
                    continue;
                }

                materialMasks.set(material, maskTexture);
            }
        }

        this.patterns = [...patternsById.values()].sort((a, b) => a.id - b.id);

        if (this.patterns.length === 0 || materialMasks.size === 0) {
            this.emitColors();
            return false;
        }

        for (const [material, maskTexture] of materialMasks) {
            this.attachMaterial(material, maskTexture);
        }

        this.emitColors();
        return this.materialStates.size > 0;
    }

    attachMaterial(material, maskTexture) {
        if (this.materialStates.has(material)) return;

        const originalOnBeforeCompile = material.onBeforeCompile;
        const originalProgramCacheKey = material.customProgramCacheKey;
        const sourceColors = this.patterns.map(({ originalColor }) =>
            toLinearColor(originalColor));
        const selectedColors = this.patterns.map(({ color }) =>
            toLinearColor(color));
        const changedPatterns = this.patterns.map(() => 1);
        const applyBranches = this.patterns
            .map(
                ({ id }, index) => `
    if (rvPatternId == ${id}.0) {
        if (rvPatternChanged[${index}] < 0.5) return rvBaseColor;
        float rvSourceLuma = max(dot(rvPatternSourceColors[${index}], rvLumaWeights), 0.025);
        float rvTextureLuma = dot(rvBaseColor, rvLumaWeights);
        float rvDetail = clamp(rvTextureLuma / rvSourceLuma, 0.25, 4.0);
        return clamp(rvPatternColors[${index}] * rvDetail, 0.0, 1.0);
    }`,
            )
            .join("");
        const shaderHelpers = `
uniform sampler2D rvPatternIdMask;
uniform vec3 rvPatternColors[${this.patterns.length}];
uniform vec3 rvPatternSourceColors[${this.patterns.length}];
uniform float rvPatternChanged[${this.patterns.length}];

vec3 rvApplyPatternColor(vec3 rvBaseColor, vec2 rvUv) {
    vec3 rvEncodedId = floor(texture2D(rvPatternIdMask, rvUv).rgb * 255.0 + 0.5);
    float rvPatternId = rvEncodedId.r + rvEncodedId.g * 256.0 + rvEncodedId.b * 65536.0;
    const vec3 rvLumaWeights = vec3(0.2126, 0.7152, 0.0722);
    ${applyBranches}
    return rvBaseColor;
}
`;

        material.onBeforeCompile = (shader, renderer) => {
            originalOnBeforeCompile?.call(material, shader, renderer);
            shader.uniforms.rvPatternIdMask = { value: maskTexture };
            shader.uniforms.rvPatternColors = { value: selectedColors };
            shader.uniforms.rvPatternSourceColors = { value: sourceColors };
            shader.uniforms.rvPatternChanged = { value: changedPatterns };
            shader.fragmentShader = shader.fragmentShader
                .replace(
                    "#include <map_pars_fragment>",
                    `#include <map_pars_fragment>\n${shaderHelpers}`,
                )
                .replace(
                    "#include <map_fragment>",
                    `
#ifdef USE_MAP
    vec4 sampledDiffuseColor = texture2D(map, vMapUv);
    #ifdef DECODE_VIDEO_TEXTURE
        sampledDiffuseColor = sRGBTransferEOTF(sampledDiffuseColor);
    #endif
    sampledDiffuseColor.rgb = rvApplyPatternColor(sampledDiffuseColor.rgb, vMapUv);
    diffuseColor *= sampledDiffuseColor;
#endif`,
                );
            this.compiledShaders.add(shader);
        };
        material.customProgramCacheKey = () =>
            `${originalProgramCacheKey?.call(material) ?? ""}|rv-pattern-mask-${this.patterns.length}`;
        material.needsUpdate = true;

        this.materialStates.set(material, {
            originalOnBeforeCompile,
            originalProgramCacheKey,
            maskTexture,
            sourceColors,
            selectedColors,
            changedPatterns,
        });
    }

    getTextures() {
        return [...this.maskTextures];
    }

    getColors() {
        return this.patterns.map(({ id, color, originalColor }) => ({
            id,
            color,
            originalColor,
        }));
    }

    setColor(patternId, color) {
        if (this.destroyed || !/^#[0-9a-f]{6}$/i.test(color)) return false;

        const patternIndex = this.patterns.findIndex(
            ({ id }) => id === Number(patternId),
        );
        if (patternIndex === -1) return false;

        const normalizedColor = color.toLowerCase();
        this.patterns[patternIndex].color = normalizedColor;

        for (const state of this.materialStates.values()) {
            state.selectedColors[patternIndex].setStyle(
                normalizedColor,
                THREE.SRGBColorSpace,
            );
            state.changedPatterns[patternIndex] = 1;
        }

        this.emitColors();
        return true;
    }

    resetColors() {
        if (this.destroyed) return false;

        for (let index = 0; index < this.patterns.length; index += 1) {
            const originalColor = this.patterns[index].originalColor;
            this.patterns[index].color = originalColor;

            for (const state of this.materialStates.values()) {
                state.selectedColors[index].setStyle(
                    originalColor,
                    THREE.SRGBColorSpace,
                );
                state.changedPatterns[index] = 1;
            }
        }

        this.emitColors();
        return true;
    }

    emitColors() {
        if (!this.destroyed) this.onColorsChange(this.getColors());
    }

    destroy() {
        if (this.destroyed) return;

        this.destroyed = true;

        for (const [material, state] of this.materialStates) {
            material.onBeforeCompile = state.originalOnBeforeCompile;
            material.customProgramCacheKey = state.originalProgramCacheKey;
            material.needsUpdate = true;
        }

        this.materialStates.clear();
        this.compiledShaders.clear();
        this.maskTextures.clear();
        this.patterns = [];
        this.gltf = null;
        this.meshes = null;
        this.onColorsChange = null;
    }
}
