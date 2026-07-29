import * as THREE from 'three';
import Experience from "../Experience.js";
import Environment from './Environment.js';
import RV from './RV.js';

export default class World{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.destroyed = false;
        this.onResourcesReady = ()=>{
            if(this.destroyed) return;
            this.envronment = new Environment();
            this.rv = new RV("threejs-assets/regent/models/48FLB/Regent Hauler Flyer_48FLB_(10707)_V7-optimized-2k.glb");
        };
        this.resources.on('ready', this.onResourcesReady);
    }

    update(){
        
    }
    changeRV(modelPath){
        this.rv?.destroy();
        this.rv = new RV(modelPath);
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        this.resources?.off('ready', this.onResourcesReady);
        
        this.rv?.destroy();
        this.envronment?.destroy();

        this.rv = null;
        this.envronment = null;
        this.scene = null;
        this.resources = null;
    }
}
