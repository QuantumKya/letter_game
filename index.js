/* Canvas Setup */

canvas.width = CANVASW;
canvas.height = CANVASH;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);



/* Other Stuff */

const player = new Player();

const bullet1 = new Bullet(
    BulletUtils.linearTravel(new Victor(-20, -30), 35, 200),
    BulletUtils.DIAMOND
);
bullet1.start();

let Osupport = BulletUtils.circleGroup(
    BulletUtils.CIRCLE,
    25,
    new Victor(CANVASW / 2, CANVASH / 2), CANVASW / 2 - 50, 0, 100, true, 'inward'
);
for (const bullet of Osupport) bullet.start();


let bulletManager = new BulletManager();
bulletManager.addBullet(Osupport, 0.5, 10);
//bulletManager.start();

let rain = BulletUtils.rainAttack(
    BulletUtils.LINE,
    150, CANVASW - 150,
    250,
    10, 15
);
rain.start();



function animFrame() {
    requestAnimationFrame(animFrame);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    //bullet1.update();
    for (const bullet of Osupport) bullet.update();
    //bulletManager.update();
    rain.update();

    // Player Damage Check
    player.checkForWhite(ctx);

    // Player Drawing
    player.update();
    player.draw(ctx);

    // UI Drawing
    ctx.font = '50px Monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(`${player.health}/5`, 10, 680);
}
animFrame();



/* Event Listeners */



