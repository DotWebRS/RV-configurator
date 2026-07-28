import {GUI} from 'dat.gui';
export default class Debug{
    constructor(){
        this.active = window.location.hash === '#debug';
        if(this.active){
            this.ui = new GUI();
        }
    }

    destroy(){
        this.ui?.destroy();
        this.ui = null;
        this.active = false;
    }
}
