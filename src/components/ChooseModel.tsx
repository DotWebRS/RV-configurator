"use client";

import { modelConfigurations } from "./data";
import { useConfiguratorUi, useExperienceRef } from "../three/ExperienceContext";

const ChooseModel = () => {
    const experienceRef = useExperienceRef();
    const {
        activeModelId,
        setActiveModelId,
        setSelectedFloorPlanId,
        setActiveCameraView,
        setViewMode,
        isModelLoading,
        setModelLoading,
    } = useConfiguratorUi();

    const handleClick = async (modelId: string) => {
        const model = modelConfigurations.find((item) => item.id === modelId);
        const firstPlan = model?.floorPlans[0];
        const experience = experienceRef.current;

        if (!model || !firstPlan || !experience || isModelLoading || modelId === activeModelId) return;

        setActiveModelId(model.id);
        setSelectedFloorPlanId(firstPlan.id);
        setViewMode("Exterior");
        experience.setCameraInteractionMode("Exterior");
        setActiveCameraView("Right View");
        experience.updateCameraView("right");
        setModelLoading(true);

        try {
            await experience.changeRV(firstPlan.modelPath);
        } finally {
            setModelLoading(false);
        }
    };

    return (
        <div className="choose-model">
            <p className="choose-model-title">Choose Model</p>
            <div className="choose-model-tabs">
                {modelConfigurations.map((model) => (
                    <button
                        key={model.id}
                        disabled={model.floorPlans.length === 0 || isModelLoading}
                        className={model.id === activeModelId ? "tab active" : "tab"}
                        onClick={() => handleClick(model.id)}
                        title={model.floorPlans.length === 0 ? "Floor plans and model will be added soon" : undefined}
                    >
                        {model.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChooseModel;
