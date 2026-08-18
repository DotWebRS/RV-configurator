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
        this.readySettled = false;
        this.ready = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
        this.onResourcesReady = ()=>{
            if(this.destroyed) return;
            this.envronment = new Environment();
            this.rv = new RV("/threejs-assets/Elegante/models/elegante test.glb");
            this.rv.ready.then((success) => {
                this.finishReady(success);
            });
        };
        this.resources.on('ready', this.onResourcesReady);
    }

    finishReady(success){
        if(this.readySettled) return;

        this.readySettled = true;
        this.resolveReady?.(success);
        this.resolveReady = null;
    }

    update(){
        
    }
    changeRV(modelPath){
        if(this.destroyed) return Promise.resolve(false);

        this.rv?.destroy();
        this.experience.notifyTextureColorsChanged([]);
        this.rv = new RV(modelPath);
        return this.rv.ready;
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        this.finishReady(false);
        this.resources?.off('ready', this.onResourcesReady);
        
        this.rv?.destroy();
        this.envronment?.destroy();

        this.rv = null;
        this.envronment = null;
        this.scene = null;
        this.resources = null;
        this.ready = null;
        this.resolveReady = null;
    }
}
