import { useState } from "react";
import "./RightPanel.css";

const floorPlans = [
    {
        id: 1,
        name: "33EFS",
        height: "13'5\"",
        length: "33'",
        width: "8'6\"",
        gvwr: "16,000",
        grey: "40 gal",
        black: "40 gal",
        fresh: "75 gal",
    },
    {
        id: 2,
        name: "33EFS",
        height: "13'5\"",
        length: "33'",
        width: "8'6\"",
        gvwr: "16,000",
        grey: "40 gal",
        black: "40 gal",
        fresh: "75 gal",
    },
    {
        id: 3,
        name: "35G",
        height: "13'5\"",
        length: "35'",
        width: "8'6\"",
        gvwr: "18,000",
        grey: "60 gal",
        black: "40 gal",
        fresh: "100 gal",
    }
];

const RightPanel = () => {

    const [selectedCard, setSelectedCard] = useState(1);

    return (

        <div className="right-panel">

            <h2 className="right-title">

                Customize Your Luxe Toy Hauler

            </h2>

            <p className="right-step">

                <strong>Step 1:</strong> Select the Floor Plan

            </p>

            <div className="right-buttons">

                <button
                    className="step-button"
                    onClick={() => console.log("Kliknuo sam na previous")}
                >

                    Previous

                </button>

                <button
                    className="step-button"
                    onClick={() => console.log("Kliknuo sam na next!")}
                >

                    Next

                </button>
            </div>
            <div className="right-divider"></div>

            <div className="floorplan-container">

                {

                    floorPlans.map((plan) => (

                        <div
                            key={plan.id}
                            className={`floor-card ${selectedCard === plan.id ? "active" : ""}`}
                            onClick={() => setSelectedCard(plan.id)}
                        >

                            <div className="floor-image">

                                <img
                                    src="/images/floor-plan.jpg"
                                    alt=""
                                />

                                {
                                    selectedCard === plan.id && (
                                        <img
                                            src="/icons/check-circle.png"
                                            className="check-icon"
                                            alt=""
                                        />
                                    )
                                }

                                <button
                                    className="zoom-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Kliknuo sam zoom!");
                                    }}
                                >

                                    <img
                                        src="/icons/zoom-in.png"
                                        alt=""
                                    />

                                </button>

                            </div>

                            <div className="floor-content">

                                <h4>{plan.name}</h4>

                                <p>Height: {plan.height} &nbsp; / &nbsp; Length: {plan.length}</p>

                                <p>Width: {plan.width} &nbsp; / &nbsp; GVWR: {plan.gvwr}</p>

                                <p>Grey Water: {plan.grey}</p>

                                <p>Black Water: {plan.black}</p>

                                <p>Fresh Water: {plan.fresh}</p>

                            </div>

                        </div>

                    ))

                }

            </div>

            <div className="build-summary">

                <h3>Build Summary</h3>

                <div className="summary-row">
                    <span>Base Price</span>
                    <span>$176.745</span>
                </div>

                <div className="summary-row">
                    <span>Selected Upgrades</span>
                    <span>$4.900</span>
                </div>

                <div className="summary-row total">
                    <span>Estimated Total</span>
                    <span>$181.645</span>
                </div>

                <hr />

                <div className="summary-header">

                    <span>Selected Items (2)</span>

                    <span
                        className="view-all"
                        onClick={() => console.log("Kliknuo sam na View all!")}
                    >

                        View all

                    </span>

                </div>

                <div className="summary-buttons">

                    <button className="review-button">

                        Review Build

                    </button>

                    <button className="send-button">

                        Send My Build

                    </button>

                </div>

            </div>

        </div>

    );

};

export default RightPanel;