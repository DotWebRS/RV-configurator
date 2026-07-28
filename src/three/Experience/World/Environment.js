import * as THREE from 'three';
import Experience from "../Experience.js";
export default class Environment{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.debug = this.experience.debug;

        if(this.debug.active){
            this.debugFolder = this.debug.ui.addFolder("enviornment");
        }

        this.setSunLight();
        this.setFillLight();
        this.setHemisphereLight();
        this.setAmbientLight();
    }
    setSunLight(){
        this.sunLight = new THREE.DirectionalLight('#ffffff', 2.5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.set(
            2048,
            2048
        );

        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 30;

        this.sunLight.shadow.camera.left = -8;
        this.sunLight.shadow.camera.right = 8;
        this.sunLight.shadow.camera.top = 8;
        this.sunLight.shadow.camera.bottom = -8;

        this.sunLight.shadow.bias = -0.0001;
        this.sunLight.shadow.normalBias = 0.02;
        this.sunLight.shadow.radius = 3;
        this.sunLight.position.set(5,38,5);
        this.scene.add(this.sunLight);

        if(this.debug.active){
            this.debugFolder
                .add(this.sunLight, 'intensity')
                .name('sunLightIntensity')
                .min(0)
                .max(10)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'x')
                .name('sunLightX')
                .min(-5)
                .max(5)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'y')
                .name('sunLightY')
                .min(-5)
                .max(5)
                .step(0.001);
            this.debugFolder
                .add(this.sunLight.position, 'z')
                .name('sunLightZ')
                .min(-5)
                .max(5)
                .step(0.001);
        }
    }

    setFillLight() {
        /**
         * Veoma blago svetlo sa suprotne strane.
         * Ne treba da preuzme ulogu HDRI-ja.
         */
        this.fillLight =
            new THREE.DirectionalLight(
                "#dce8ff",
                0.35
            );

        this.fillLight.position.set(-4, 3, -5);

        this.fillLight.target.position.set(0, 1, 0);

        this.scene.add(this.fillLight);
        this.scene.add(this.fillLight.target);

        if (this.debug.active) {
            this.debugFolder
                .add(this.fillLight, "intensity")
                .name("fillLightIntensity")
                .min(0)
                .max(3)
                .step(0.01);
        }
    }

    setHemisphereLight(){
        this.hemisphereLight = new THREE.HemisphereLight(

            0xffffff,   // boja neba

            0x8b8b8b,   // boja poda

            0.85

        );

        this.scene.add(this.hemisphereLight);
    }

    setAmbientLight(){
        this.ambientLight = new THREE.AmbientLight(
            0xffffff,
            0.45
        );

        this.scene.add(this.ambientLight);
    }

    destroy(){
        this.sunLight?.removeFromParent();
        this.sunLight?.target?.removeFromParent();
        this.sunLight?.shadow?.dispose?.();

        this.fillLight?.removeFromParent();
        this.fillLight?.target?.removeFromParent();
        this.fillLight?.shadow?.dispose?.();

        this.debugFolder?.destroy?.();

        this.sunLight = null;
        this.fillLight = null;
        this.debugFolder = null;
        this.scene = null;
        this.resources = null;
    }
}
