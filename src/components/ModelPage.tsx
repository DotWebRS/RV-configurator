import "./ModelPage.css";

import ChooseModel from "./ChooseModel";
import Viewer from "./Viewer";

const ModelPage = () => {

    return (

        <div className="model-page">

            <div className="left-side">

                <ChooseModel/>

                <Viewer/>

            </div>

            <div className="right-side">

            </div>

        </div>

    );

};

export default ModelPage;