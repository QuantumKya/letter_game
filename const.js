const LEFT = new Victor(-1, 0);
const RIGHT = new Victor(1, 0);
const UP = new Victor(0, -1);
const DOWN = new Victor(0, 1);

const CANVASW = 700;
const CANVASH = 700;

const canvas = document.querySelector("canvas"); // canvas setup
const ctx = canvas.getContext("2d"); // canvas context

const hitsound = new Audio("snd_hurt1.wav");

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