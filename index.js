/* Canvas Setup */

canvas.width = CANVASW;
canvas.height = CANVASH;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);



/* Other Stuff */

const player = new Player();

const bullet1 = new Bullet(
    BulletUtils.circularTravel(new Victor(300, 300), 100, 30, 60, true, 'outward'),
    BulletUtils.DIAMOND
);

let ring = BulletUtils.circleGroup(
    BulletUtils.DIAMOND,
    12,
    new Victor(300, 300), 150, 0, 60, true, 'inward'
);
for (const b of ring) b.begin();

let bulletManager = new BulletManager();
bulletManager.addBullet(ring, 1.5, 3);
bulletManager.start();



function animFrame() {
    requestAnimationFrame(animFrame);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    ctx.fillStyle = "white";
    ctx.fillRect(400, 500, 5, 5);

    //bullet1.update();
    //for (const bullet of ring) bullet.update();
    bulletManager.update();

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



