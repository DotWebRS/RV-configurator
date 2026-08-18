import * as THREE from 'three';
import Experience from "../Experience.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default class Environment{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;
        this.destroyed = false;
        this.lightTarget = new THREE.Vector3(0.5, 2.25, 1.26);

        if(this.debug.active){
            this.debugFolder = this.debug.ui.addFolder("enviornment");
        }

        this.setSunLight();
        this.setSurroundLights();
        this.setHemisphereLight();
        this.hdrRequestId = 0;
        this.currentHDR = null;
        this.pendingHDR = null;
        this.setHDR("horn-koppe_spring_1k.hdr");
    }
    setSunLight(){
        this.sunLight = new THREE.DirectionalLight('#fffaf2', 1.35);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.set(
            2048,
            2048
        );

        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 50;

        this.sunLight.shadow.camera.left = -12;
        this.sunLight.shadow.camera.right = 12;
        this.sunLight.shadow.camera.top = 12;
        this.sunLight.shadow.camera.bottom = -12;

        this.sunLight.shadow.bias = -0.0001;
        this.sunLight.shadow.normalBias = 0.02;
        this.sunLight.shadow.radius = 3;
        this.sunLight.position.set(6, 14, 8);
        this.sunLight.target.position.copy(this.lightTarget);
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        if(this.debug.active){
            this.debugFolder
                .add(this.sunLight, 'intensity')
                .name('keyLightIntensity')
                .min(0)
                .max(10)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'x')
                .name('sunLightX')
                .min(-20)
                .max(20)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'y')
                .name('sunLightY')
                .min(-20)
                .max(20)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'z')
                .name('sunLightZ')
                .min(-20)
                .max(20)
                .step(0.001);
        }
    }

    setSurroundLights() {
        const lightSettings = [
            {
                name: "frontLight",
                position: new THREE.Vector3(0.5, 6.5, 16)
            },
            {
                name: "backLight",
                position: new THREE.Vector3(0.5, 6.5, -16)
            },
            {
                name: "leftLight",
                position: new THREE.Vector3(-16, 6.5, 1.26)
            },
            {
                name: "rightLight",
                position: new THREE.Vector3(16, 6.5, 1.26)
            }
        ];

        this.surroundLights = lightSettings.map((settings) => {
            const light = new THREE.DirectionalLight("#eef2f8", 0.9);
            light.name = settings.name;
            light.position.copy(settings.position);
            light.target.position.copy(this.lightTarget);

            this.scene.add(light);
            this.scene.add(light.target);

            if (this.debug.active) {
                this.debugFolder
                    .add(light, "intensity")
                    .name(`${settings.name}Intensity`)
                    .min(0)
                    .max(2)
                    .step(0.01);
            }

            return light;
        });
    }

    setHemisphereLight(){
        this.hemisphereLight = new THREE.HemisphereLight(

            0xd8e2f0,   // boja neba

            0x596574,   // boja poda

            0.9

        );

        this.scene.add(this.hemisphereLight);

        if (this.debug.active) {
            this.debugFolder
                .add(this.hemisphereLight, "intensity")
                .name("hemisphereIntensity")
                .min(0)
                .max(2)
                .step(0.01);
        }
    }

    setHDR(fileName){
        if (this.destroyed) return;
        if (fileName === this.currentHDR) {
            if (this.pendingHDR && this.pendingHDR !== fileName) {
                this.hdrRequestId += 1;
                this.pendingHDR = null;
            }
            return;
        }
        if (fileName === this.pendingHDR) return;

        const requestId = ++this.hdrRequestId;
        this.pendingHDR = fileName;

        new RGBELoader()
        .setPath("/threejs-assets/hdr/")
        .load(fileName, (texture) => {
            if (this.destroyed || requestId !== this.hdrRequestId) {
                texture.dispose();
                return;
            }

            const previousTexture = this.environmentTexture;
            this.environmentTexture = texture;
            this.environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
            this.currentHDR = fileName;
            this.pendingHDR = null;

            this.scene.environment = this.environmentTexture;
            this.scene.environmentIntensity = 1.5;
            this.scene.background = null;

            if (previousTexture && previousTexture !== texture) previousTexture.dispose();
        }, undefined, (error) => {
            if (requestId === this.hdrRequestId) this.pendingHDR = null;
            console.error(`HDR load failed: ${fileName}`, error);
        });
    }

    destroy(){
        if (this.destroyed) return;
        this.destroyed = true;
        this.hdrRequestId += 1;

        this.sunLight?.removeFromParent();
        this.sunLight?.target?.removeFromParent();
        this.sunLight?.shadow?.dispose?.();

        this.surroundLights?.forEach((light) => {
            light.removeFromParent();
            light.target?.removeFromParent();
            light.shadow?.dispose?.();
        });

        this.hemisphereLight?.removeFromParent();

        this.debugFolder?.destroy?.();

        if (this.scene?.environment === this.environmentTexture) {
            this.scene.environment = null;
        }
        this.environmentTexture?.dispose();
        this.environmentTexture = null;
        this.currentHDR = null;
        this.pendingHDR = null;
        this.sunLight = null;
        this.surroundLights = null;
        this.hemisphereLight = null;
        this.lightTarget = null;
        this.debugFolder = null;
        this.scene = null;
        this.resources = null;
        
    }
}
