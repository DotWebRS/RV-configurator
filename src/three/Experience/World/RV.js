import * as THREE from 'three';
import Experience from "../Experience.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export default class RV{
    constructor(modelPath){
        this.Experience = new Experience();
        this.scene = this.Experience.scene;
        this.loadModel(modelPath);
    }

    loadModel(modelPath){
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/threejs-assets/draco/");
        dracoLoader.preload();

        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(dracoLoader);
        this.dracoLoader = dracoLoader;

        this.gltfLoader.load(
            modelPath,
            (file) => {
                this.model = file.scene;
                this.model.traverse((child) => {

                    if (child.isMesh) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.material) {

                            //child.material.side = THREE.FrontSide;
                            child.material.vertexColors = false;
                            child.material.metalness = 0;
                            child.material.metalnessMap = null;
                            child.material.roughness = 0.6;
                            child.material.needsUpdate = true;


                        }
                    }

                });
                this.scene.add(this.model);
            },
            (xhr) => {

                if (xhr.total) {

                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading: ${progress.toFixed(1)}%`);

                }

            },

            // Error
            (error) => {

                console.error("GLTF loading failed:");
                console.error(error);

            }
        );
    }

    destroy() {

        this.dracoLoader.dispose();

    }
}