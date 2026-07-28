import * as THREE from 'three';
import Experience from "./Experience.js";

export default class Renderer{
    constructor(){

        this.experience = new Experience();

        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        this.setInstance();
    }

    setInstance(){
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        })
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 1.0;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFShadowMap;
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }

    resize(){
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }

    update(){
        this.instance.render(this.scene, this.camera.instance);
    }

    destroy({ loseContext = true } = {}){
        if(!this.instance) return;

        this.instance.setAnimationLoop(null);
        this.instance.renderLists.dispose();
        this.instance.dispose();

        if(loseContext){
            this.instance.forceContextLoss();
        }

        this.instance = null;
        this.scene = null;
        this.camera = null;
        this.canvas = null;
    }
}
