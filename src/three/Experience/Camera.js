import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Experience from "./Experience.js";
import gsap from "gsap";

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
        this.activeView = "right";
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
        const position = this.positions[view];

        if (!position || !this.instance || !this.controls) {
            return;
        }

        this.activeView = view;

        this.viewTimeline?.kill();
        gsap.killTweensOf([
            this.instance.position,
            this.controls.target,
            this.instance.up
        ]);

        this.animateCameraArc(position, view);
    }

    isMobileViewport() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    getDistanceForZoomPercent(percent) {
        const normalizedPercent = THREE.MathUtils.clamp(percent, 0, 100) / 100;
        const { minDistance, maxDistance } = this.zoomSettings;

        return THREE.MathUtils.lerp(
            maxDistance,
            minDistance,
            normalizedPercent
        );
    }

    getViewUp(view) {
        if (view === "top") return new THREE.Vector3(-1, 0, 0);
        if (view === "bottom") return new THREE.Vector3(1, 0, 0);
        return new THREE.Vector3(0, 1, 0);
    }

    animateCameraArc(position, view) {
        const startTarget = this.controls.target.clone();
        const endTarget = position.target.clone();
        const startOffset = this.instance.position.clone().sub(startTarget);
        const endOffset = position.camera.clone().sub(endTarget);
        const startDirection = startOffset.clone().normalize();
        const endDirection = endOffset.clone().normalize();
        const startUp = this.instance.up.clone().normalize();
        const endUp = this.getViewUp(view);
        const positionRotation = new THREE.Quaternion().setFromUnitVectors(
            startDirection,
            endDirection
        );
        const upRotation = new THREE.Quaternion().setFromUnitVectors(
            startUp,
            endUp
        );
        const currentPositionRotation = new THREE.Quaternion();
        const currentUpRotation = new THREE.Quaternion();
        const identityRotation = new THREE.Quaternion();
        const currentTarget = new THREE.Vector3();
        const currentDirection = new THREE.Vector3();
        const currentUp = new THREE.Vector3();
        const progress = { value: 0 };
        const startDistance = startOffset.length();
        const endDistance = this.isMobileViewport()
            ? this.getDistanceForZoomPercent(60)
            : endOffset.length();
        const finalPosition = endTarget.clone()
            .addScaledVector(endDirection, endDistance);

        this.viewTimeline = gsap.to(progress, {
            value: 1,
            duration: 2,
            ease: "power3.inOut",
            overwrite: "auto",
            onUpdate: () => {
                currentPositionRotation.slerpQuaternions(
                    identityRotation,
                    positionRotation,
                    progress.value
                );
                currentUpRotation.slerpQuaternions(
                    identityRotation,
                    upRotation,
                    progress.value
                );

                currentTarget.lerpVectors(
                    startTarget,
                    endTarget,
                    progress.value
                );

                currentDirection
                    .copy(startDirection)
                    .applyQuaternion(currentPositionRotation);

                currentUp
                    .copy(startUp)
                    .applyQuaternion(currentUpRotation)
                    .normalize();

                const distance = THREE.MathUtils.lerp(
                    startDistance,
                    endDistance,
                    progress.value
                );

                this.controls.target.copy(currentTarget);
                this.instance.position
                    .copy(currentTarget)
                    .addScaledVector(currentDirection, distance);
                this.instance.up.copy(currentUp);
                this.controls.update();
            },
            onComplete: () => {
                this.controls.target.copy(endTarget);
                this.instance.position.copy(finalPosition);
                this.instance.up.copy(endUp);
                this.controls.update();
                this.viewTimeline = null;
            }
        });
    }
    setZoomPercent(percent) {
        if (!this.instance || !this.controls) {
            return;
        }

        const clampedPercent = THREE.MathUtils.clamp(percent, 0, 100);
        const newDistance = this.getDistanceForZoomPercent(clampedPercent);

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
        this.viewTimeline?.kill();
        gsap.killTweensOf([
            this.instance?.position,
            this.controls?.target,
            this.instance?.up
        ]);
        this.controls?.dispose();
        this.instance?.removeFromParent();
        this.controls = null;
        this.instance = null;
        this.scene = null;
        this.canvas = null;
        this.onDebugClick = null;
        this.viewTimeline = null;
        this.activeView = null;
    }
}
