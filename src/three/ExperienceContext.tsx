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
    updateCameraView: (view: string) => void;
    setZoomPercent: (percent: number) => void;
    getZoomPercent: () => number;
    onZoomChange: (callback: (percent: number) => void) => () => void;
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

type ExperienceRef = MutableRefObject<ExperienceInstance | null>;

const ExperienceContext = createContext<ExperienceRef | null>(null);

type ConfiguratorUiContextValue = {
    activeCameraView: string;
    setActiveCameraView: (view: string) => void;
    isModelLoading: boolean;
    setModelLoading: (loading: boolean) => void;
};

const ConfiguratorUiContext = createContext<ConfiguratorUiContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
    const experienceRef = useRef<ExperienceInstance | null>(null);
    const [activeCameraView, setActiveCameraView] = useState("Right View");
    const [isModelLoading, setModelLoading] = useState(true);

    return (
        <ExperienceContext.Provider value={experienceRef}>
            <ConfiguratorUiContext.Provider
                value={{
                    activeCameraView,
                    setActiveCameraView,
                    isModelLoading,
                    setModelLoading,
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
            "useExperienceRef mora biti korišćen unutar ExperienceProvider-a.",
        );
    }

    return experienceRef;
}

export function useConfiguratorUi() {
    const context = useContext(ConfiguratorUiContext);

    if (!context) {
        throw new Error(
            "useConfiguratorUi mora biti korišćen unutar ExperienceProvider-a.",
        );
    }

    return context;
}
