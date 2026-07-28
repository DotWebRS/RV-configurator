function collectTextures(value, textures, visited) {
    if (!value || typeof value !== 'object' || visited.has(value)) return;

    visited.add(value);

    if (value.isTexture) {
        textures.add(value);
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => collectTextures(item, textures, visited));
        return;
    }

    for (const nestedValue of Object.values(value)) {
        collectTextures(nestedValue, textures, visited);
    }
}

export function disposeTexture(texture, disposedTextures = new Set(), disposedImages = new Set()) {
    if (!texture?.isTexture || disposedTextures.has(texture)) return;

    disposedTextures.add(texture);
    texture.dispose();

    const image = texture.source?.data ?? texture.image;
    if (image && typeof image.close === 'function' && !disposedImages.has(image)) {
        disposedImages.add(image);
        image.close();
    }
}

export function disposeMaterial(
    material,
    {
        disposeTextures = true,
        disposedMaterials = new Set(),
        disposedTextures = new Set(),
        disposedImages = new Set()
    } = {}
) {
    const materials = Array.isArray(material) ? material : [material];

    for (const currentMaterial of materials) {
        if (!currentMaterial || disposedMaterials.has(currentMaterial)) continue;

        if (disposeTextures) {
            const textures = new Set();
            const visited = new Set();

            for (const value of Object.values(currentMaterial)) {
                collectTextures(value, textures, visited);
            }

            collectTextures(currentMaterial.uniforms, textures, visited);

            for (const texture of textures) {
                disposeTexture(texture, disposedTextures, disposedImages);
            }
        }

        currentMaterial.dispose?.();
        disposedMaterials.add(currentMaterial);
    }
}

export function disposeObject3D(root, { disposeTextures = true, removeFromParent = true } = {}) {
    if (!root) return;

    const disposedGeometries = new Set();
    const disposedMaterials = new Set();
    const disposedTextures = new Set();
    const disposedImages = new Set();
    const disposedSkeletons = new Set();

    root.traverse?.((object) => {
        if (object.geometry && !disposedGeometries.has(object.geometry)) {
            object.geometry.dispose?.();
            disposedGeometries.add(object.geometry);
        }

        if (object.material) {
            disposeMaterial(object.material, {
                disposeTextures,
                disposedMaterials,
                disposedTextures,
                disposedImages
            });
        }

        if (object.skeleton && !disposedSkeletons.has(object.skeleton)) {
            disposeTexture(object.skeleton.boneTexture, disposedTextures, disposedImages);
            object.skeleton.dispose?.();
            disposedSkeletons.add(object.skeleton);
        }
    });

    if (root.isScene) {
        disposeTexture(root.background, disposedTextures, disposedImages);
        disposeTexture(root.environment, disposedTextures, disposedImages);
        root.background = null;
        root.environment = null;
        root.clear();
    } else if (removeFromParent) {
        root.removeFromParent?.();
    }
}

export function disposeLoadedResource(resource) {
    if (!resource) return;

    if (resource.isTexture) {
        disposeTexture(resource);
        return;
    }

    const scenes = new Set();
    if (resource.scene) scenes.add(resource.scene);
    resource.scenes?.forEach((scene) => scenes.add(scene));

    if (scenes.size > 0) {
        scenes.forEach((scene) => disposeObject3D(scene));
        return;
    }

    if (resource.isObject3D) {
        disposeObject3D(resource);
        return;
    }

    resource.dispose?.();
}
