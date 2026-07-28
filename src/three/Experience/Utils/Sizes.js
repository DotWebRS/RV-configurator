import EventEmitter from "./EventEmitter.js";
import Experience from "../Experience.js";
export default class Sizes extends EventEmitter{
    constructor(){
        super();
        this.Experience = new Experience();
        this.canvas = this.Experience.canvas;
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);        

        window.addEventListener('resize', ()=>{
            canvasResized();
        });
    }
    canvasResized(){
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.trigger("resize");
    }
}