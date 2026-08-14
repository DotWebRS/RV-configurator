"use client";

import { useRef } from "react";
import {
    useConfiguratorUi,
    useExperienceRef,
} from "../../three/ExperienceContext";
import { getFloorPlan, type RoomCamera } from "../data";


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

    const views = viewMode === "Interior"
        ? [
            { label: "Kitchen", image: "/images/interior option view mode/kitchen.jpg", camera: "kitchen", coordinates: selectedPlan?.rooms.kitchen },
            { label: "Living area", image: "/images/interior option view mode/living.jpg", camera: "livingroom", coordinates: selectedPlan?.rooms.livingroom },
            { label: "Bedroom", image: "/images/interior option view mode/bedroom.jpg", camera: "bedroom", coordinates: selectedPlan?.rooms.bedroom },
            { label: "Bathroom", image: "/images/interior option view mode/bathroom.jpg", camera: "bathroom", coordinates: selectedPlan?.rooms.bathroom },
        ]
        : ["Front View", "Back View", "Left View", "Right View"].map((label) => ({
            label,
            image: "/images/card-image.png",
            camera: label.split(" ")[0].toLowerCase(),
            coordinates: undefined as RoomCamera | undefined,
        }));


    const handleCardClick = (view: { label: string; camera: string; coordinates?: RoomCamera }) => {
        if (isModelLoading || activeCameraView === view.label) return;

        const experience = experienceRef.current;

        if (!experience) {
            console.warn("Experience još nije inicijalizovan.");
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
                                        src={view.image}
                                        alt={view.label}
                                    />

                                    <div className="camera-card-footer">

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
