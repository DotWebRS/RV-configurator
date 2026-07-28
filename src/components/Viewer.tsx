"use client";

import { useState, useRef, useEffect } from "react";
import {
    useExperienceRef,
    type ExperienceInstance,
} from "../three/ExperienceContext";

const Viewer = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cursorMode, setCursorMode] = useState("arrow");
    const scrollPosition = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const experienceRef = useExperienceRef();
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);

    };
    useEffect(() => {
        if (isFullscreen) {
            scrollPosition.current = window.scrollY;

            window.scrollTo(0, 0);
            document.querySelector(".fullscreen-background")?.classList.remove("not-visible");
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            
            document.querySelector(".fullscreen-background")?.classList.add("not-visible");
            window.scrollTo(0, scrollPosition.current);
        }
        experienceRef.current?.sizes.canvasResized();
    }, [isFullscreen]);

    useEffect(() => {
        if (!canvasRef.current) return;

        let cancelled = false;

        const createExperience = async () => {
            const { default: Experience } = await import('../three/Experience/Experience');

            if (cancelled || !canvasRef.current) return;

            const experience = new Experience(canvasRef.current);

            if (cancelled) {
                experience.destroy();
                return;
            }

            experienceRef.current = experience as ExperienceInstance;
        };

        createExperience();

        return () => {
            cancelled = true;
            document.body.style.overflow = "auto";
            experienceRef.current?.destroy();
            experienceRef.current = null;
        };
    }, []);

    return (
        <>
        <div className="not-visible fullscreen-background">

        </div>
        

        <div className={`viewer ${isFullscreen ? "fullscreen" : ""}`}
            style={{
                cursor: cursorMode === "hand" ? "grab" : "default",
            }}>

            <div className="viewer-title">

                <h3>

                    Full-time luxury built for a single rear-wheel pickup

                </h3>

                <p>

                    From $174,100 | 1 Floor Plan

                </p>

            </div>

            <div
                className="rotate-hint"
                onClick={() => console.log("Kliknuo sam na rotate!")}
                >
                <img
                    src="/icons/rotate-icon.png"
                    alt="Rotate"
                    className="rotate-icon"
                />

                <span className="rotate-text">
                    Drag to rotate
                </span>
                </div>


            <div className="view-badge">
                <span className="view-number">360°</span>
                <span className="view-text">VIEW</span>
            </div>

            {/* <img

                src="/images/model-image.png"

                alt="model"

                className="model-image"

            />*/}
            <canvas ref={canvasRef}></canvas>

            {/* DONJI LEVI KONTROLER */}
            <div className="cursor-controls">

                <button
                className={`icon-button ${
                    cursorMode === "arrow" ? "active" : ""
                }`}
                onClick={() => setCursorMode("arrow")}
                >
                <img
                    src="/icons/arrow-icon.png"
                    alt="arrow cursor"
                />
                </button>


                <button
                className={`icon-button ${
                    cursorMode === "hand" ? "active" : ""
                }`}
                onClick={() => setCursorMode("hand")}
                >
                <img
                    src="/icons/hand-icon.png"
                    alt="hand cursor"
                />
                </button>

            </div>

            <div className="zoom-controls">
                <button
                    className="zoom-btn"
                    onClick={() => console.log("Kliknuo sam -!")}
                >
                    -
                </button>

                <div className="zoom-value">
                    100%
                </div>

                <button
                    className="zoom-btn"
                    onClick={() => console.log("Kliknuo sam +!")}
                >
                    +
                </button>
            </div>

            <div className="viewer-actions">

                <button
                    className="reset-button"
                    onClick={() => console.log("Reset!")}
                >
                    <img
                    src="/icons/undo.png"
                    alt="reset"
                    />

                    <span>Reset</span>
                </button>

                <button
                    className="fullscreen-button"
                    onClick={toggleFullscreen}
                >
                    <img
                    src={
                        isFullscreen
                        ? "/icons/exit-fullscreen.png"
                        : "/icons/fullscreen.png"
                    }
                    alt="fullscreen"
                    />
                </button>

                </div>



        </div>


        </>
    );

};

export default Viewer;
