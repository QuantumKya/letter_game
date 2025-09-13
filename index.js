import './victor.min.js';
import { Player } from './classes.js';
import { CANVASH, CANVASW } from './const.js';

/* Canvas Setup */

const canvas = document.querySelector("canvas"); // canvas setup
const ctx = canvas.getContext("2d"); // canvas context


canvas.width = CANVASW;
canvas.height = CANVASH;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);



/* Other Stuff */

const player = new Player();







function animFrame() {
    requestAnimationFrame(animFrame);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    ctx.fillStyle = "white";
    ctx.fillRect(400, 500, 5, 5);

    // Player Damage Check
    player.checkForWhite(ctx);

    // Player Drawing
    player.update();
    player.draw(ctx);

    // UI Drawing
    ctx.font = '50px Monospace'
    ctx.fillText(`${player.health}/5`, 10, 680);
}
animFrame();



/* Event Listeners */



