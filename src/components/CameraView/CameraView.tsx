"use client";

import { useState, useRef } from "react";
import { cameraViews } from "../data";
import { useExperienceRef } from "../../three/ExperienceContext";


const CameraView = () => {

    const [selectedView, setSelectedView] = useState<string | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const experienceRef = useExperienceRef();


    const handleCardClick = (view: string) => {
        const experience = experienceRef.current;

        if (!experience) {
            console.warn("Experience još nije inicijalizovan.");
            return;
        }

        setSelectedView(view);
        console.log(view.split(" ")[0].toLowerCase());
        experience.updateCameraView(view.split(" ")[0].toLowerCase());

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

                            cameraViews.map((view) => (

                                <div
                                    className={`camera-card ${
                                        selectedView === view ? "active" : ""
                                    }`}
                                    key={view}
                                    onClick={() => handleCardClick(view)}
                                >

                                    <img
                                        src="/images/card-image.png"
                                        alt={view}
                                    />

                                    <div className="camera-card-footer">

                                        {view}

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
