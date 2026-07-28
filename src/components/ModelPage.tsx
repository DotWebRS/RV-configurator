"use client";

import RightPanel from "./RightPanel";
import ChooseModel from "./ChooseModel";
import Viewer from "./Viewer";
import ViewMode from "./ViewMode/ViewMode";
import CameraView from "./CameraView/CameraView";
import { ExperienceProvider } from "../three/ExperienceContext";

const ModelPage = () => {

    return (

        <ExperienceProvider>
            <div className="model-page">

                <div className="left-side">

                    <ChooseModel/>

                    <Viewer/>
                    <div className="viewer-bottom">
                        <ViewMode />
                        <CameraView />
                    </div>
                </div>

                <div className="right-side">
                    <RightPanel/>
                </div>

            </div>
        </ExperienceProvider>

    );

};

export default ModelPage;
