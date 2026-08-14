"use client";

import { useConfiguratorUi, useExperienceRef } from "../../three/ExperienceContext";
import { getFloorPlan } from "../data";

const viewModes = [
    {
        label: "Interior",
        icon: "/icons/home.png",
    },
    {
        label: "Exterior",
        icon: "/icons/bus.png",
    },
];

const ViewMode = () => {

    const experienceRef = useExperienceRef();
    const { viewMode, setViewMode, setActiveCameraView, isModelLoading, activeModelId, selectedFloorPlanId } = useConfiguratorUi();

    const handleClick = (index: number) => {
        if (isModelLoading) return;
        const mode = viewModes[index].label as "Interior" | "Exterior";
        setViewMode(mode);
        const initialView = mode === "Interior" ? "Kitchen" : "Right View";
        setActiveCameraView(initialView);
        const kitchenCoordinates = getFloorPlan(activeModelId, selectedFloorPlanId)?.rooms.kitchen;
        experienceRef.current?.updateCameraView(mode === "Interior" ? "kitchen" : "right", mode === "Interior" ? kitchenCoordinates : undefined);
    };

    return (

        <div className="view-mode">

            <p className="view-mode-title">
                View Mode
            </p>

            <div className="view-mode-buttons">

                {
                    viewModes.map((mode, index) => (

                        <button
                            key={mode.label}
                            className={
                                mode.label === viewMode
                                    ? "view-button active"
                                    : "view-button"
                            }
                            onClick={() => handleClick(index)}
                        >

                            <img
                                src={mode.icon}
                                alt={mode.label}
                                className="view-button-icon"
                            />

                            <span>{mode.label}</span>

                        </button>

                    ))
                }

            </div>

        </div>

    );

};

export default ViewMode;
