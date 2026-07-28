import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Experience from "./Experience.js";

export default class Camera{
    constructor(){
        this.experience = new Experience();
        document.body.addEventListener("click", () => {
            console.log(this.instance.position);
            console.log(this.controls.target);
        })
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.positions = {
            "top" : {
                "camera" : new THREE.Vector3(0.5, 15.7, 1.26),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            },
            "right" : {
                "camera" : new THREE.Vector3(-12, 0.8, 6),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            },
            "left" : {
                "camera" : new THREE.Vector3(13.6, 0.4, -0.95),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            },
            "bottom" : {
                "camera" : new THREE.Vector3(0.5, -11, 1.25),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            },
            "front" : {
                "camera" : new THREE.Vector3(-0.57, 3.3, 14.6),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            },
            "back" : {
                "camera" : new THREE.Vector3(1.18, 2.4, -15.2),
                "target" : new THREE.Vector3(0.5, 2.25, 1.26)
            }
        }
        
        this.setInstance();
        this.setOrbitControls();
    }

    setInstance(){
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 200);
        this.instance.position.set(this.positions.right.camera.x, this.positions.right.camera.y, this.positions.right.camera.z);
        this.scene.add(this.instance);
    }
    setOrbitControls(){
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.target.set(this.positions.right.target.x, this.positions.right.target.y, this.positions.right.target.z);
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
    }
    resize(){
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }
    update(){
        this.controls.update();
    }
    updateCameraView(view){
        this.instance.position.set(this.positions[view].camera.x, this.positions[view].camera.y, this.positions[view].camera.z);
        this.controls.target.set(this.positions[view].target.x, this.positions[view].target.y, this.positions[view].target.z);
        if (view === "top") {
            this.instance.up.set(-1, 0, 0);
        } else if (view === "bottom") {
            this.instance.up.set(1, 0, 0);
        } else {
            this.instance.up.set(0, 1, 0);
        }
        this.controls.update();
    }

    destroy(){
        this.controls?.dispose();
        this.instance?.removeFromParent();
        this.controls = null;
        this.instance = null;
        this.scene = null;
        this.canvas = null;
    }
}
