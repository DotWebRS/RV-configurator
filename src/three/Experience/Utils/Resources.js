import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from "./EventEmitter.js";
import { disposeLoadedResource } from "./dispose.js";

export default class Resources extends EventEmitter{
    constructor(sources){
        super();

        this.sources = sources;
        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;
        this.destroyed = false;
        this.pendingResources = new Set();
        this.setLoaders();
        this.startLoading();
    }

    setLoaders(){
        this.loaders = {};
        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    startLoading(){
        if(this.sources.length == 0){
            this.trigger("ready");
            return;
        }
        for(const source of this.sources){
            if(source.type === "gltfModel"){
                const pendingResource = this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source,file)
                    },
                    undefined,
                    () => this.sourceFailed()
                );
                if(pendingResource) this.pendingResources.add(pendingResource);
            }else if(source.type === "texture"){
                const pendingResource = this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source,file)
                    },
                    undefined,
                    () => this.sourceFailed()
                );
                if(pendingResource) this.pendingResources.add(pendingResource);
            }else if(source.type === "cubeTexture"){
                const pendingResource = this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source,file);
                    },
                    undefined,
                    () => this.sourceFailed()
                );
                if(pendingResource) this.pendingResources.add(pendingResource);
            }
        }
    }

    sourceLoaded(source, file){
        this.pendingResources.delete(file);

        if(this.destroyed){
            disposeLoadedResource(file);
            return;
        }

        this.items[source.name] = file;

        this.loaded++;
        if(this.loaded == this.toLoad){
            this.trigger("ready");
        }

    }

    sourceFailed(){
        if(this.destroyed) return;

        this.loaded++;
        if(this.loaded == this.toLoad){
            this.trigger("ready");
        }
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        super.destroy();

        const resources = new Set([
            ...Object.values(this.items),
            ...this.pendingResources
        ]);

        resources.forEach((resource) => disposeLoadedResource(resource));

        this.items = {};
        this.pendingResources.clear();
        this.loaders = {};
        this.sources = [];
    }
}
