const LEFT = new Victor(-1, 0);
const RIGHT = new Victor(1, 0);
const UP = new Victor(0, -1);
const DOWN = new Victor(0, 1);

const CANVASW = 700;
const CANVASH = 700;

const canvas = document.querySelector("canvas"); // canvas setup
const ctx = canvas.getContext("2d"); // canvas context

const DEGRAD = (x) => Math.PI * x / 180;
const RADDEG = (x) => 180 * x / Math.PI;