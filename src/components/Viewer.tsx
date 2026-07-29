"use client";

import { useState, useRef, useEffect } from "react";
import {
    useExperienceRef,
    type ExperienceInstance,
} from "../three/ExperienceContext";

const Viewer = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cursorMode, setCursorMode] = useState("arrow");
    const [zoomPercent, setZoomPercent] = useState("100");
    const scrollPosition = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const experienceRef = useExperienceRef();
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);

    };
    const applyZoomPercent = (value: number) => {
        const nextPercent = Math.min(100, Math.max(0, value));
        setZoomPercent(String(Math.round(nextPercent)));
        experienceRef.current?.setZoomPercent(nextPercent);
    };
    const changeZoomBy = (amount: number) => {
        const currentPercent = Number(zoomPercent);
        applyZoomPercent(
            (Number.isFinite(currentPercent) ? currentPercent : 100) + amount
        );
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
        let unsubscribeZoom = () => {};

        const createExperience = async () => {
            const { default: Experience } = await import('../three/Experience/Experience');

            if (cancelled || !canvasRef.current) return;

            const experience = new Experience(canvasRef.current);

            if (cancelled) {
                experience.destroy();
                return;
            }

            experienceRef.current = experience as ExperienceInstance;
            experience.setZoomPercent(100);
            unsubscribeZoom = experience.onZoomChange((percent: number) => {
                setZoomPercent(String(Math.round(percent)));
            });
        };

        createExperience();

        return () => {
            cancelled = true;
            unsubscribeZoom();
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
                    onClick={() => changeZoomBy(-5)}
                    aria-label="Smanji zoom za 5%"
                >
                    -
                </button>

                <div className="zoom-value">
                    <input
                        className="zoom-input"
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={zoomPercent}
                        onChange={(event) => {
                            const value = event.target.value;
                            setZoomPercent(value);

                            if (value === "") return;

                            const numericValue = Number(value);
                            if (Number.isFinite(numericValue)) {
                                applyZoomPercent(numericValue);
                            }
                        }}
                        onBlur={() => {
                            if (zoomPercent === "") {
                                applyZoomPercent(
                                    experienceRef.current?.getZoomPercent() ?? 100
                                );
                            }
                        }}
                        aria-label="Zoom procenat"
                    />
                    <span aria-hidden="true">%</span>
                </div>

                <button
                    className="zoom-btn"
                    onClick={() => changeZoomBy(5)}
                    aria-label="Povećaj zoom za 5%"
                >
                    +
                </button>
            </div>

            <div className="viewer-actions">

                <button
                    className="reset-button"
                    onClick={() => {
                        const experience = experienceRef.current;

                        if (!experience) {
                            console.warn("Experience još nije inicijalizovan.");
                            return;
                        }
                        experience.updateCameraView("right");
                    }}
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
