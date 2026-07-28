import * as THREE from 'three';
import Experience from "../Experience.js";
import Environment from './Environment.js';
import Cube from './Cube.js';

export default class World{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resources.on('ready', ()=>{
            this.envronment = new Environment();
            this.cube = new Cube();
        });
    }

    update(){
        this.cube?.update();
    }
}