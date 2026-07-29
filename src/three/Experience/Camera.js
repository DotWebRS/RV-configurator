import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Experience from "./Experience.js";

export default class Camera{
    constructor(){
        this.experience = new Experience();
        this.onDebugClick = () => {
            console.log(this.instance.position);
            console.log(this.controls.target);
            console.log(this.instance);
            console.log(this.controls);
        };
        document.body.addEventListener("click", this.onDebugClick);
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.zoomSettings = {
            minDistance: new THREE.Vector3(-12, 0.8, 6)
                .distanceTo(new THREE.Vector3(0.5, 2.25, 1.26)),

            maxDistance: new THREE.Vector3(-36, -2, 15)
                .distanceTo(new THREE.Vector3(0.5, 2.25, 1.26))
        };
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
        this.controls.minDistance = this.zoomSettings.minDistance;
        this.controls.maxDistance = this.zoomSettings.maxDistance;
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
    setZoomPercent(percent) {
        if (!this.instance || !this.controls) {
            return;
        }

        const clampedPercent = THREE.MathUtils.clamp(percent, 0, 100);
        const normalizedPercent = clampedPercent / 100;

        const { minDistance, maxDistance } = this.zoomSettings;

        const newDistance = THREE.MathUtils.lerp(
            maxDistance,
            minDistance,
            normalizedPercent
        );

        const direction = new THREE.Vector3()
            .subVectors(this.instance.position, this.controls.target);

        if (direction.lengthSq() === 0) {
            return;
        }

        direction.normalize();

        this.instance.position
            .copy(this.controls.target)
            .addScaledVector(direction, newDistance);

        this.controls.update();
    }

    getZoomPercent() {
        if (!this.instance || !this.controls) {
            return 100;
        }

        const currentDistance = this.instance.position.distanceTo(
            this.controls.target
        );
        const { minDistance, maxDistance } = this.zoomSettings;

        const percent = THREE.MathUtils.mapLinear(
            currentDistance,
            maxDistance,
            minDistance,
            0,
            100
        );

        return THREE.MathUtils.clamp(percent, 0, 100);
    }

    onZoomChange(callback) {
        if (!this.controls) {
            return () => {};
        }

        const handleControlsChange = () => {
            callback(this.getZoomPercent());
        };

        this.controls.addEventListener("change", handleControlsChange);
        handleControlsChange();

        return () => {
            this.controls?.removeEventListener("change", handleControlsChange);
        };
    }

    destroy(){
        document.body.removeEventListener("click", this.onDebugClick);
        this.controls?.dispose();
        this.instance?.removeFromParent();
        this.controls = null;
        this.instance = null;
        this.scene = null;
        this.canvas = null;
        this.onDebugClick = null;
    }
}
