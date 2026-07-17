import { useState } from "react";
import "./ChooseModel.css";
import { models } from "./data";

const ChooseModel = () => {

    const [activeModel, setActiveModel] = useState(0);

    const handleClick = (index: number) => {

        setActiveModel(index);

        console.log(`Kliknuo sam na ${models[index]}`);

    };

    return (

        <div className="choose-model">

            <p className="choose-model-title">
                Choose Model
            </p>

            <div className="choose-model-tabs">

                {

                    models.map((model, index) => (

                        <button

                            key={model}

                            className={
                                index === activeModel
                                    ? "tab active"
                                    : "tab"
                            }

                            onClick={() => handleClick(index)}

                        >

                            {model}

                        </button>

                    ))

                }

            </div>

        </div>

    );

};

export default ChooseModel;