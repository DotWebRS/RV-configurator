import "./ModelPage.css";

import ChooseModel from "./ChooseModel";
import Viewer from "./Viewer";
import ViewMode from "./ViewMode/ViewMode";
import CameraView from "./CameraView/CameraView";

const ModelPage = () => {

    return (

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

            </div>

        </div>

    );

};

export default ModelPage;