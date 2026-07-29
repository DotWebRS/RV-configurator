"use client";

import { useState, useRef, useEffect } from "react";
import {
    useExperienceRef,
    useConfiguratorUi,
    type ExperienceInstance,
    type PatternColor,
} from "../three/ExperienceContext";

const Viewer = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cursorMode, setCursorMode] = useState("arrow");
    const [zoomPercent, setZoomPercent] = useState("100");
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [patternColors, setPatternColors] = useState<PatternColor[]>([]);
    const scrollPosition = useRef(0);
    const zoomPercentRef = useRef("100");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const experienceRef = useExperienceRef();
    const {
        isModelLoading,
        setModelLoading,
        setActiveCameraView,
    } = useConfiguratorUi();
    const getActualZoomMaximum = () =>
        typeof window !== "undefined"
        && window.matchMedia("(max-width: 768px)").matches
            ? 60
            : 100;
    const displayToActualZoom = (displayPercent: number) =>
        displayPercent * getActualZoomMaximum() / 100;
    const actualToDisplayZoom = (actualPercent: number) =>
        actualPercent * 100 / getActualZoomMaximum();
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);

    };
    const applyZoomPercent = (value: number) => {
        const nextPercent = Math.min(100, Math.max(0, value));
        setZoomPercent(String(Math.round(nextPercent)));
        experienceRef.current?.setZoomPercent(displayToActualZoom(nextPercent));
    };
    const changeZoomBy = (amount: number) => {
        const currentPercent = Number(zoomPercent);
        applyZoomPercent(
            (Number.isFinite(currentPercent) ? currentPercent : 100) + amount
        );
    };
    useEffect(() => {
        zoomPercentRef.current = zoomPercent;
    }, [zoomPercent]);

    useEffect(() => {
        const mobileQuery = window.matchMedia("(max-width: 768px)");
        const handleViewportChange = () => {
            const displayPercent = Number(zoomPercentRef.current);

            if (!Number.isFinite(displayPercent)) return;

            experienceRef.current?.setZoomPercent(
                displayPercent * (mobileQuery.matches ? 60 : 100) / 100,
            );
        };

        mobileQuery.addEventListener("change", handleViewportChange);
        return () => mobileQuery.removeEventListener("change", handleViewportChange);
    }, []);

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
        let unsubscribeTextureColors = () => {};

        const createExperience = async () => {
            const { default: Experience } = await import('../three/Experience/Experience');

            if (cancelled || !canvasRef.current) return;

            const experience = new Experience(canvasRef.current);

            if (cancelled) {
                experience.destroy();
                return;
            }

            experienceRef.current = experience as ExperienceInstance;
            experience.setZoomPercent(getActualZoomMaximum());
            unsubscribeZoom = experience.onZoomChange((percent: number) => {
                setZoomPercent(String(Math.round(actualToDisplayZoom(percent))));
            });
            unsubscribeTextureColors = experience.onTextureColorsChange(
                (colors: PatternColor[]) => {
                    setPatternColors(colors);
                },
            );

            await experience.whenInitialModelReady();

            if (!cancelled) {
                setModelLoading(false);
            }
        };

        createExperience();

        return () => {
            cancelled = true;
            unsubscribeZoom();
            unsubscribeTextureColors();
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

            <div className="palette-control">
                <button
                    type="button"
                    className={`palette-trigger ${isPaletteOpen ? "active" : ""}`}
                    onClick={() => setIsPaletteOpen((open) => !open)}
                    aria-expanded={isPaletteOpen}
                    aria-controls="viewer-color-palette"
                    disabled={isModelLoading || patternColors.length === 0}
                >
                    <span className="palette-icon" aria-hidden="true" />
                    <span>Color palette</span>
                </button>

                {isPaletteOpen && patternColors.length > 0 && (
                    <div
                        id="viewer-color-palette"
                        className="pattern-palette"
                        aria-label="Pattern colors"
                    >
                        {patternColors.map((pattern) => (
                            <label
                                key={pattern.id}
                                className="pattern-color"
                                style={{ backgroundColor: pattern.color }}
                                title={`Pattern ${pattern.id}: ${pattern.color}`}
                            >
                                <input
                                    type="color"
                                    value={pattern.color}
                                    onChange={(event) => {
                                        experienceRef.current?.setTextureColor(
                                            pattern.id,
                                            event.target.value,
                                        );
                                    }}
                                    aria-label={`Change pattern ${pattern.id} color`}
                                />
                            </label>
                        ))}
                    </div>
                )}
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

            {isModelLoading && (
                <div
                    className="model-loading-overlay"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading model"
                >
                    <div className="model-loading-spinner" aria-hidden="true" />
                    <p>Loading model <span aria-hidden="true">. . .</span></p>
                </div>
            )}

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
                                    actualToDisplayZoom(
                                        experienceRef.current?.getZoomPercent()
                                            ?? getActualZoomMaximum(),
                                    )
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
                        experience.resetTextureColors();
                        experience.updateCameraView("right");
                        setActiveCameraView("Right View");
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
