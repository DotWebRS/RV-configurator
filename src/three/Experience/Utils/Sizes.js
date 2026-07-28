import EventEmitter from "./EventEmitter.js";
export default class Sizes extends EventEmitter{
    constructor(canvas){
        super();
        this.canvas = canvas;
        this.destroyed = false;
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.onResize = this.canvasResized.bind(this);
        window.addEventListener('resize', this.onResize);
    }
    canvasResized(){
        if(this.destroyed || !this.canvas?.parentElement) return;

        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.trigger("resize");
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        window.removeEventListener('resize', this.onResize);
        super.destroy();
        this.canvas = null;
    }
}
