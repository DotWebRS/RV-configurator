import { useState } from "react";
import "./ViewMode.css";

const viewModes = [
    {
        label: "Interior",
        icon: "/icons/home.png",
    },
    {
        label: "Exterior",
        icon: "/icons/bus.png",
    },
];

const ViewMode = () => {

    const [activeMode, setActiveMode] = useState(1);

    const handleClick = (index: number) => {
        setActiveMode(index);
        console.log(`Kliknuo sam na ${viewModes[index].label}`);
    };

    return (

        <div className="view-mode">

            <p className="view-mode-title">
                Model View
            </p>

            <div className="view-mode-buttons">

                {
                    viewModes.map((mode, index) => (

                        <button
                            key={mode.label}
                            className={
                                index === activeMode
                                    ? "view-button active"
                                    : "view-button"
                            }
                            onClick={() => handleClick(index)}
                        >

                            <img
                                src={mode.icon}
                                alt={mode.label}
                                className="view-button-icon"
                            />

                            <span>{mode.label}</span>

                        </button>

                    ))
                }

            </div>

        </div>

    );

};

export default ViewMode;