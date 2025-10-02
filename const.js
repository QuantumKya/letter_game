const LEFT = new Victor(-1, 0);
const RIGHT = new Victor(1, 0);
const UP = new Victor(0, -1);
const DOWN = new Victor(0, 1);

const CANVASW = 700;
const CANVASH = 700;

const canvas = document.querySelector("canvas"); // canvas setup
const ctx = canvas.getContext("2d"); // canvas context
ctx.imageSmoothingEnabled = false;

const hitsound = new Audio("snd_hurt1.wav");
const bombimage = new Image();
bombimage.src = 'bomb.png';

const varRegister = {
    filler: 0
};

let CURRENTFRAME = 0;
const FPS = 60;

let mousePos = new Victor(0, 0);
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mousex = event.clientX - rect.x;
    const mousey = event.clientY - rect.y;
    mousePos = new Victor(mousex, mousey);
});
const getAngleToMouse = (x, y) => {
    return Math.atan2(mousePos.y - y, mousePos.x - x);
};

/**
 * Converts from degrees to radians.
 */
const DEGRAD = (x) => Math.PI * x / 180;
/**
 * Converts from radians to degrees.
 */
const RADDEG = (x) => 180 * x / Math.PI;
/**
 * Adds 180 to angle.
 */
const FLIPANGLE = (x) => (180 + x) % 360;


const wavetext = (n, time) => {
    const wtext = new TextObject(`Wave ${n}`, time+0.2, time+1.8);
    wtext.setPos(new Victor(CANVASW/2, CANVASH/2));
    wtext.setFontSize(100);
    wtext.setSpacing(20);
    wtext.setLetterMove(textf);
    wtext.setSpelling(10);

    return wtext;
}
const textf = (t) => {
    const scl = ((t) => {
        if (t <= (0.25) * FPS) {
            return new Victor(1, 1).multiplyScalar(1 + 0.5 * ((0.25 * FPS) - t));
        }
        if (t > 1.75 * FPS) {
            return new Victor(1, 1).multiplyScalar((0.25 * FPS) - t);
        }
        else return new Victor(1, 1);
    })(t);

    const pos = ((t) => {
        if (t >= (0.25) * FPS) {
            return new Victor(10*Math.cos(10 * (Math.PI / 2) * (t - (0.25)*FPS) / ((4-0.25)*FPS)), 0);
        }
        else return new Victor(0, 0);
    })(t);

    return {
        pos: pos,
        rotation: 0,
        scale: scl
    };
};