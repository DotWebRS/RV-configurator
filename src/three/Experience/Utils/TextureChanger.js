import * as THREE from "three";
import { disposeTexture } from "./dispose.js";

const EXTENSION_NAME = "EXT_mesh_features";
const FEATURE_LABEL = "rvPatternId";

function toHexColor(sourceColor) {
    return `#${sourceColor
        .map((channel) => Math.max(0, Math.min(255, channel))
            .toString(16)
            .padStart(2, "0"))
        .join("")}`;
}

function toLinearColor(color) {
    return new THREE.Color().setStyle(color, THREE.SRGBColorSpace);
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

        const metadata = gltf.parser?.json?.extras?.rvPatternMasks;
        this.patterns = (metadata?.palette ?? []).map(({ id, sourceColor }) => {
            const originalColor = toHexColor(sourceColor);

            return {
                id,
                sourceColor: [...sourceColor],
                originalColor,
                color: originalColor,
            };
        });
    }

    async initialize() {
        if (this.destroyed || this.patterns.length === 0) return false;

        const parser = this.gltf.parser;
        const materialMasks = new Map();

        for (const mesh of this.meshes) {
            const extension = mesh.userData?.gltfExtensions?.[EXTENSION_NAME];
            const feature = extension?.featureIds?.find(
                (entry) => entry.label === FEATURE_LABEL && entry.texture,
            );
            const textureIndex = feature?.texture?.index;

            if (!Number.isInteger(textureIndex) || !mesh.material) continue;

            const maskTexture = await parser.getDependency("texture", textureIndex);
            if (this.destroyed) {
                maskTexture?.dispose();
                return false;
            }

            maskTexture.colorSpace = THREE.NoColorSpace;
            maskTexture.magFilter = THREE.NearestFilter;
            maskTexture.minFilter = THREE.NearestFilter;
            maskTexture.generateMipmaps = false;
            maskTexture.needsUpdate = true;
            this.maskTextures.add(maskTexture);

            const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];

            for (const material of materials) {
                if (!material || !material.map) continue;

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
        const changedPatterns = this.patterns.map(() => 0);
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
                state.changedPatterns[index] = 0;
            }
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
                state.changedPatterns[index] = 0;
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

        const disposedTextures = new Set();
        const disposedImages = new Set();
        for (const texture of this.maskTextures) {
            disposeTexture(texture, disposedTextures, disposedImages);
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
