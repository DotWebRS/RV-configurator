"use client";

import { useRef } from "react";
import {
    useConfiguratorUi,
    useExperienceRef,
} from "../../three/ExperienceContext";
import { getFloorPlan, interiorRoomOptions, type InteriorRoomId, type RoomCamera } from "../data";


const CameraView = () => {

    const sliderRef = useRef<HTMLDivElement>(null);
    const experienceRef = useExperienceRef();
    const {
        activeCameraView,
        setActiveCameraView,
        isModelLoading,
        viewMode,
        activeModelId,
        selectedFloorPlanId,
    } = useConfiguratorUi();
    const selectedPlan = getFloorPlan(activeModelId, selectedFloorPlanId);

    const interiorViews = selectedPlan
        ? (Object.entries(selectedPlan.rooms) as [InteriorRoomId, RoomCamera][]).map(([camera, coordinates]) => ({
            ...interiorRoomOptions[camera],
            camera,
            coordinates,
        }))
        : [];
    const views = viewMode === "Interior"
        ? interiorViews
        : [
            { label: "Front View", image: "/images/exterior option view mode/frontview.png", camera: "front" },
            { label: "Back View", image: "/images/exterior option view mode/backview.png", camera: "back" },
            { label: "Left View", image: "/images/exterior option view mode/leftview.png", camera: "left" },
            { label: "Right View", image: "/images/exterior option view mode/rightview.png", camera: "right" },
        ].map((view) => ({
            ...view,
            coordinates: undefined as RoomCamera | undefined,
        }));


    const handleCardClick = (view: { label: string; camera: string; coordinates?: RoomCamera }) => {
        if (isModelLoading || activeCameraView === view.label) return;

        const experience = experienceRef.current;

        if (!experience) {
            console.warn("Experience has not been initialized yet.");
            return;
        }

        setActiveCameraView(view.label);
        experience.updateCameraView(view.camera, view.coordinates);

    };

    const scrollSlider = (direction:"left"|"right") => {

        if(!sliderRef.current) return;


        sliderRef.current.scrollBy({

            left: direction === "right" ? 300 : -300,

            behavior:"smooth"

        });

    };

    return (

        <div className="camera-view">

            <p className="camera-view-title">
                Camera View
            </p>

            <div className="camera-slider">

                <button
                    className="camera-arrow"
                    onClick={() => scrollSlider("left")}
                >

                    <img
                        src="/icons/chevron-left.png"
                        alt="left"
                    />

                </button>

                <div className="camera-window" ref={sliderRef}>

                    <div
                        className="camera-track"
                    >

                        {

                            views.map((view) => (

                                <div
                                    className={`camera-card ${
                                        activeCameraView === view.label ? "active" : ""
                                    }`}
                                    key={view.label}
                                    onClick={() => handleCardClick(view)}
                                >

                                    <img
                                        className={viewMode === "Exterior" ? "camera-card-image-exterior" : undefined}
                                        src={view.image}
                                        alt={view.label}
                                    />

                                    <div className={`camera-card-footer ${
                                        view.camera === "garage-half-bath" ? "camera-card-footer-long" : ""
                                    }`}>

                                        {view.label}

                                    </div>

                                </div>

                            ))

                        }

                    </div>

                </div>

                <button
                    className="camera-arrow"
                    onClick={() => scrollSlider("right")}
                >

                    <img
                        src="/icons/chevron-right.png"
                        alt="right"
                    />

                </button>

            </div>

        </div>

    );

};

export default CameraView;
