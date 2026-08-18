"use client";

import {
    createContext,
    useContext,
    useRef,
    type MutableRefObject,
    type ReactNode,
} from "react";
import { useState } from "react";

export type ExperienceInstance = {
    destroy: () => void;
    unloadWorld: () => void;
    reloadWorld: (sources?: unknown[]) => void;
    updateCameraView: (view: string, coordinates?: { cameraPosition: [number, number, number]; target: [number, number, number] }) => void;
    setCameraInteractionMode: (mode: "Interior" | "Exterior") => void;
    setZoomPercent: (percent: number) => void;
    getZoomPercent: () => number;
    onZoomChange: (callback: (percent: number) => void) => () => void;
    getTextureColors: () => PatternColor[];
    setTextureColor: (patternId: number, color: string) => boolean;
    resetTextureColors: () => boolean;
    onTextureColorsChange: (
        callback: (colors: PatternColor[]) => void
    ) => () => void;
    whenInitialModelReady: () => Promise<boolean>;
    changeRV: (modelPath: string) => Promise<boolean>;
    sizes: {
        canvasResized: () => void;
    };
    camera: unknown;
    renderer: unknown;
    scene: unknown;
    world: unknown;
};

export type PatternColor = {
    id: number;
    color: string;
    originalColor: string;
};

type ExperienceRef = MutableRefObject<ExperienceInstance | null>;

const ExperienceContext = createContext<ExperienceRef | null>(null);

type ConfiguratorUiContextValue = {
    activeModelId: string;
    setActiveModelId: (modelId: string) => void;
    selectedFloorPlanId: string;
    setSelectedFloorPlanId: (floorPlanId: string) => void;
    viewMode: "Interior" | "Exterior";
    setViewMode: (mode: "Interior" | "Exterior") => void;
    activeCameraView: string;
    setActiveCameraView: (view: string) => void;
    isModelLoading: boolean;
    setModelLoading: (loading: boolean) => void;
    patternColors: PatternColor[];
    setPatternColors: (colors: PatternColor[]) => void;
};

const ConfiguratorUiContext = createContext<ConfiguratorUiContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
    const experienceRef = useRef<ExperienceInstance | null>(null);
    const [activeCameraView, setActiveCameraView] = useState("Right View");
    const [activeModelId, setActiveModelId] = useState("regent");
    const [selectedFloorPlanId, setSelectedFloorPlanId] = useState("regent-48flb");
    const [viewMode, setViewMode] = useState<"Interior" | "Exterior">("Exterior");
    const [isModelLoading, setModelLoading] = useState(true);
    const [patternColors, setPatternColors] = useState<PatternColor[]>([]);

    return (
        <ExperienceContext.Provider value={experienceRef}>
            <ConfiguratorUiContext.Provider
                value={{
                    activeModelId,
                    setActiveModelId,
                    selectedFloorPlanId,
                    setSelectedFloorPlanId,
                    viewMode,
                    setViewMode,
                    activeCameraView,
                    setActiveCameraView,
                    isModelLoading,
                    setModelLoading,
                    patternColors,
                    setPatternColors,
                }}
            >
                {children}
            </ConfiguratorUiContext.Provider>
        </ExperienceContext.Provider>
    );
}

export function useExperienceRef() {
    const experienceRef = useContext(ExperienceContext);

    if (!experienceRef) {
        throw new Error(
            "useExperienceRef must be used within ExperienceProvider.",
        );
    }

    return experienceRef;
}

export function useConfiguratorUi() {
    const context = useContext(ConfiguratorUiContext);

    if (!context) {
        throw new Error(
            "useConfiguratorUi must be used within ExperienceProvider.",
        );
    }

    return context;
}
