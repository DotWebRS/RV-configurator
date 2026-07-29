"use client";

import {
    createContext,
    useContext,
    useRef,
    type MutableRefObject,
    type ReactNode,
} from "react";

export type ExperienceInstance = {
    destroy: () => void;
    unloadWorld: () => void;
    reloadWorld: (sources?: unknown[]) => void;
    updateCameraView: (view: string) => void;
    setZoomPercent: (percent: number) => void;
    getZoomPercent: () => number;
    onZoomChange: (callback: (percent: number) => void) => () => void;
    changeRV: (modelPath: string) => void;
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

export function ExperienceProvider({ children }: { children: ReactNode }) {
    const experienceRef = useRef<ExperienceInstance | null>(null);

    return (
        <ExperienceContext.Provider value={experienceRef}>
            {children}
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
