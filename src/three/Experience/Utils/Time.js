import EventEmitter from "./EventEmitter.js";

export default class Time extends EventEmitter{
    constructor(){
        super();

        this.start = Date.now();
        this.current = this.start;
        this.currentTime = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.destroyed = false;

        this.rafId = window.requestAnimationFrame(this.tick);
    }

    tick = () => {
        if(this.destroyed) return;

        const currentTime = Date.now();
        this.delta = currentTime - this.currentTime;
        this.currentTime = currentTime;
        this.current = currentTime;
        this.elapsed = this.current - this.start;
        this.trigger('tick');
        this.rafId = window.requestAnimationFrame(this.tick);
    }

    destroy(){
        if(this.destroyed) return;

        this.destroyed = true;
        window.cancelAnimationFrame(this.rafId);
        super.destroy();
    }
}
