import * as THREE from 'three';
import Experience from "../Experience.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
    disposeLoadedResource,
    disposeTexture
} from "../Utils/dispose.js";
import TextureChanger from "../Utils/TextureChanger.js";

export default class RV{
    constructor(modelPath){
        this.Experience = new Experience();
        this.scene = this.Experience.scene;
        this.destroyed = false;
        this.loadGeneration = 0;
        this.idleTasks = new Map();
        this.disposedResources = new WeakSet();
        this.detachedTextures = new Set();
        this.model = null;
        this.gltf = null;
        this.pendingGltf = null;
        this.textureChanger = null;
        this.modelPath = modelPath;
        this.readySettled = false;
        this.ready = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
        this.loadModel(modelPath);
    }

    finishReady(success) {
        if (this.readySettled) return;

        this.readySettled = true;
        this.resolveReady?.(success);
        this.resolveReady = null;
    }

    loadModel(modelPath){
        const generation = ++this.loadGeneration;

        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("/threejs-assets/draco/");
        this.dracoLoader.setWorkerLimit(
            Math.min(2, Math.max(1, (navigator.hardwareConcurrency || 2) - 1))
        );
        this.dracoLoader.preload();

        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this.gltfLoader.load(
            modelPath,
            (file) => {
                if (!this.isCurrentLoad(generation)) {
                    this.disposeResource(file);
                    return;
                }

                this.pendingGltf = file;
                this.prepareModel(file, generation).catch((error) => {
                    if (this.isCurrentLoad(generation)) {
                        console.error("GLTF model preparation failed:");
                        console.error(error);
                    }
                    this.textureChanger?.destroy();
                    this.textureChanger = null;
                    this.disposeResource(file);
                    this.disposeDetachedTextures();
                    if (this.pendingGltf === file) {
                        this.pendingGltf = null;
                    }
                    this.finishReady(false);
                });
            },
            (xhr) => {
                if (!this.isCurrentLoad(generation)) return;

                if (xhr.total) {

                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading: ${progress.toFixed(1)}%`);

                }

            },

            // Error
            (error) => {
                if (!this.isCurrentLoad(generation)) return;

                console.error("GLTF loading failed:");
                console.error(error);
                this.finishReady(false);

            }
        );
    }

    isCurrentLoad(generation) {
        return !this.destroyed && generation === this.loadGeneration;
    }

    disposeResource(resource) {
        if (!resource || this.disposedResources.has(resource)) return;

        this.disposedResources.add(resource);
        disposeLoadedResource(resource);
    }

    disposeDetachedTextures() {
        const disposedTextures = new Set();
        const disposedImages = new Set();

        for (const texture of this.detachedTextures) {
            disposeTexture(texture, disposedTextures, disposedImages);
        }

        this.detachedTextures.clear();
    }

    runWhenIdle(callback) {
        if (this.destroyed) {
            return Promise.resolve(false);
        }

        return new Promise((resolve) => {
            const run = (deadline) => {
                this.idleTasks.delete(handle);

                if (this.destroyed) {
                    resolve(false);
                    return;
                }

                callback(deadline);
                resolve(true);
            };

            let handle;

            if (typeof window.requestIdleCallback === "function") {
                handle = window.requestIdleCallback(run, { timeout: 100 });
            } else {
                handle = window.setTimeout(
                    () => run({ timeRemaining: () => 5 }),
                    0
                );
            }

            this.idleTasks.set(handle, { resolve });
        });
    }

    cancelIdleTasks() {
        for (const [handle, task] of this.idleTasks) {
            if (typeof window.cancelIdleCallback === "function") {
                window.cancelIdleCallback(handle);
            } else {
                window.clearTimeout(handle);
            }
            task.resolve(false);
        }

        this.idleTasks.clear();
    }

    getModelMeshes(model) {
        const meshes = [];

        model.traverse((child) => {
            if (child.isMesh) meshes.push(child);
        });

        return meshes;
    }

    configureMesh(mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

        for (const material of materials) {
            if (!material) continue;

            // material.side = THREE.FrontSide;
            /*material.vertexColors = false;
            material.metalness = 0;
            if (material.metalnessMap) {
                this.detachedTextures.add(material.metalnessMap);
            }
            material.metalnessMap = null;
            material.roughness = 0.6;
            material.needsUpdate = true;*/
        }
    }

    async configureMeshes(meshes, generation) {
        let index = 0;

        while (index < meshes.length && this.isCurrentLoad(generation)) {
            const completed = await this.runWhenIdle((deadline) => {
                let processed = 0;

                while (
                    index < meshes.length &&
                    processed < 12 &&
                    (processed === 0 || deadline.timeRemaining() > 1)
                ) {
                    this.configureMesh(meshes[index]);
                    index++;
                    processed++;
                }
            });

            if (!completed) return false;
        }

        return this.isCurrentLoad(generation);
    }

    getModelTextures(meshes) {
        const textures = new Set();

        for (const mesh of meshes) {
            const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];

            for (const material of materials) {
                if (!material) continue;

                for (const value of Object.values(material)) {
                    if (value?.isTexture) textures.add(value);
                }
            }
        }

        return [...textures];
    }

    async initializeTextures(textures, generation) {
        const renderer = this.Experience.renderer?.instance;
        if (!renderer?.initTexture) return this.isCurrentLoad(generation);

        for (const texture of textures) {
            if (!this.isCurrentLoad(generation)) return false;

            const completed = await this.runWhenIdle(() => {
                renderer.initTexture(texture);
            });

            if (!completed) return false;
        }

        return this.isCurrentLoad(generation);
    }

    async compileModel(model, generation) {
        const renderer = this.Experience.renderer?.instance;
        const camera = this.Experience.camera?.instance;

        if (!renderer?.compileAsync || !camera) {
            return this.isCurrentLoad(generation);
        }

        try {
            await renderer.compileAsync(model, camera, this.scene);
        } catch (error) {
            if (this.isCurrentLoad(generation)) {
                console.warn("Asynchronous shader preparation was skipped:", error);
            }
        }

        return this.isCurrentLoad(generation);
    }

    async prepareModel(file, generation) {
        const model = file.scene;
        const meshes = this.getModelMeshes(model);

        if (!await this.configureMeshes(meshes, generation)) {
            this.disposeResource(file);
            this.disposeDetachedTextures();
            return;
        }

        this.textureChanger = new TextureChanger(
            file,
            meshes,
            (colors) => this.Experience?.notifyTextureColorsChanged(colors),
        );
        const textureChangerReady = await this.textureChanger.initialize();

        if (!this.isCurrentLoad(generation)) {
            this.textureChanger.destroy();
            this.textureChanger = null;
            this.disposeResource(file);
            this.disposeDetachedTextures();
            return;
        }

        if (!textureChangerReady) {
            console.warn("The RV model has no masked textures with valid rvPatternColors data.");
        }

        const textures = [
            ...this.getModelTextures(meshes),
            ...this.textureChanger.getTextures(),
        ];
        if (!await this.initializeTextures(textures, generation)) {
            this.disposeResource(file);
            this.disposeDetachedTextures();
            return;
        }

        if (!await this.compileModel(model, generation)) {
            this.disposeResource(file);
            this.disposeDetachedTextures();
            return;
        }

        if (!this.isCurrentLoad(generation)) {
            this.disposeResource(file);
            this.disposeDetachedTextures();
            return;
        }

        this.pendingGltf = null;
        this.gltf = file;
        this.model = model;
        this.scene.add(this.model);
        this.finishReady(true);
    }

    getTextureColors() {
        return this.textureChanger?.getColors() ?? [];
    }

    setTextureColor(patternId, color) {
        return this.textureChanger?.setColor(patternId, color) ?? false;
    }

    resetTextureColors() {
        return this.textureChanger?.resetColors() ?? false;
    }

    destroy() {
        if (this.destroyed) return;

        this.destroyed = true;
        this.loadGeneration++;
        this.finishReady(false);
        this.cancelIdleTasks();
        this.textureChanger?.destroy();
        this.textureChanger = null;

        const resources = new Set([this.gltf, this.pendingGltf]);
        this.model?.removeFromParent();
        resources.forEach((resource) => this.disposeResource(resource));
        this.disposeDetachedTextures();

        this.dracoLoader?.dispose();

        this.model = null;
        this.gltf = null;
        this.pendingGltf = null;
        this.gltfLoader = null;
        this.dracoLoader = null;
        this.modelPath = null;
        this.ready = null;
        this.resolveReady = null;
        this.scene = null;
        this.Experience = null;
    }
}
