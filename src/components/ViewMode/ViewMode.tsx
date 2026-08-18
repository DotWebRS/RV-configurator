"use client";

import { useConfiguratorUi, useExperienceRef } from "../../three/ExperienceContext";
import { getFloorPlan, interiorRoomOptions, type InteriorRoomId, type RoomCamera } from "../data";

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
        experienceRef.current?.setCameraInteractionMode(mode);
        const selectedPlan = getFloorPlan(activeModelId, selectedFloorPlanId);
        const firstInteriorRoom = selectedPlan
            ? (Object.entries(selectedPlan.rooms) as [InteriorRoomId, RoomCamera][])[0]
            : undefined;
        const initialView = mode === "Interior" && firstInteriorRoom
            ? interiorRoomOptions[firstInteriorRoom[0]].label
            : "Right View";
        setActiveCameraView(initialView);
        experienceRef.current?.updateCameraView(
            mode === "Interior" && firstInteriorRoom ? firstInteriorRoom[0] : "right",
            mode === "Interior" ? firstInteriorRoom?.[1] : undefined,
        );
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
