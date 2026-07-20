import { useState } from "react";
import "./CameraView.css";
import { cameraViews } from "../data";

const CARD_WIDTH = 118;
const GAP = 16;

const CameraView = () => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedView, setSelectedView] = useState<string | null>(null);

    const visibleCards = 5;

    const maxIndex = cameraViews.length - visibleCards;

    const handlePrevious = () => {

        if (currentIndex > 0) {

            setCurrentIndex(currentIndex - 1);

        }

    };

    const handleNext = () => {

        if (currentIndex < maxIndex) {

            setCurrentIndex(currentIndex + 1);

        }

    };

    const handleCardClick = (view: string) => {

        setSelectedView(view);

        console.log(`Kliknuo sam na ${view} View`);

    };

    return (

        <div className="camera-view">

            <p className="camera-view-title">
                Camera View
            </p>

            <div className="camera-slider">

                <button
                    className="camera-arrow"
                    onClick={handlePrevious}
                >

                    <img
                        src="/icons/chevron-left.png"
                        alt="left"
                    />

                </button>

                <div className="camera-window">

                    <div
                        className="camera-track"
                        style={{
                            transform: `translateX(-${currentIndex * (CARD_WIDTH + GAP)}px)`
                        }}
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
                    onClick={handleNext}
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