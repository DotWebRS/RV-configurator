import * as THREE from 'three';
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from './Renderer.js';
import World from './World/World.js';
import Resources from './Utils/Resources.js';
import Debug from './Utils/Debug.js';
import sources from "./sources.js";
import { disposeObject3D } from "./Utils/dispose.js";
let instance = null;

export default class Experience{
    constructor(canvas){
        if(instance){
            return instance;
        }
        instance = this;
        this.destroyed = false;
        this.textureColorListeners = new Set();
        this.sources = sources;
        //Global access
        window.experience = this;

        this.canvas = canvas;
        this.debug = new Debug();
        this.sizes = new Sizes(this.canvas);
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.resources = new Resources(this.sources);
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World();

        this.onResize = ()=>{
            this.resize();
        };
        this.sizes.on('resize', this.onResize);

        this.onTick = ()=>{
            this.update();
        };
        this.time.on('tick', this.onTick);
    }

    updateCameraView(view, coordinates){
        this.camera.updateCameraView(view, coordinates);
    }
    setZoomPercent(percent){
        this.camera.setZoomPercent(percent);
    }
    getZoomPercent(){
        return this.camera.getZoomPercent();
    }
    onZoomChange(callback){
        return this.camera.onZoomChange(callback);
    }
    getTextureColors(){
        return this.world?.rv?.getTextureColors() ?? [];
    }
    setTextureColor(patternId, color){
        return this.world?.rv?.setTextureColor(patternId, color) ?? false;
    }
    resetTextureColors(){
        return this.world?.rv?.resetTextureColors() ?? false;
    }
    onTextureColorsChange(callback){
        this.textureColorListeners.add(callback);
        callback(this.getTextureColors());

        return () => {
            this.textureColorListeners?.delete(callback);
        };
    }
    notifyTextureColorsChanged(colors){
        for(const callback of this.textureColorListeners){
            callback(colors);
        }
    }
    whenInitialModelReady(){
        return this.world?.ready ?? Promise.resolve(false);
    }
    resize(){
        this.camera.resize();
        this.renderer.resize();
    }

    update(){
        if(this.destroyed) return;

        this.camera.update();
        this.world.update();
        this.renderer.update();
    }
    
    changeRV(modelPath){
        if(this.destroyed || !this.world) return Promise.resolve(false);

        return this.world.changeRV(modelPath);
    }

    unloadWorld(){
        this.world?.destroy();
        this.resources?.destroy();
        this.world = null;
        this.resources = null;
    }

    reloadWorld(nextSources = this.sources){
        if(this.destroyed) return;

        this.unloadWorld();
        this.sources = nextSources;
        this.resources = new Resources(this.sources);
        this.world = new World();
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        this.textureColorListeners.clear();

        this.time?.off('tick', this.onTick);
        this.sizes?.off('resize', this.onResize);
        this.time?.destroy();
        this.sizes?.destroy();

        this.unloadWorld();
        this.camera?.destroy();

        disposeObject3D(this.scene, { disposeTextures: true, removeFromParent: false });
        this.renderer?.destroy({ loseContext: true });
        this.debug?.destroy();

        if(window.experience === this){
            delete window.experience;
        }
        if(instance === this){
            instance = null;
        }

        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.debug = null;
        this.sizes = null;
        this.time = null;
        this.onResize = null;
        this.onTick = null;
        this.textureColorListeners = null;
    }
}
