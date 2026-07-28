import * as THREE from 'three';
import Experience from "../Experience.js";

export default class Cube{
    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }
    setGeometry(){
        this.geometry = new THREE.BoxGeometry(1,1,1);
    }
    setMaterial(){
        //this.resources.items.logoTexture.encoding = THREE.sRGBEncoding;
        this.material = new THREE.MeshBasicMaterial({
            map: this.resources.items.logoTexture,
            transparent: true,
            color: new THREE.Color(0xffffff)
        });
    }
    setMesh(){
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    update(){
        if(this.mesh){
            this.mesh.rotation.x += 0.01;
            this.mesh.rotation.y += 0.01;
            this.mesh.rotation.z += 0.01;
        }
    }
}