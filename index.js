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

let rain = BulletUtils.rainAttack(
    BulletUtils.LINE,
    150, CANVASW - 150,
    250,
    10, 15
);
bulletManager.addBM(rain, 1.5);

let plosive = BulletUtils.explosion(
    new Victor(200, 200),
    8,
    1.5, 0.5, 1, 0.5
);

let plosives = [];
for (let i = 0; i < 5; i++) {
    bulletManager.addBullet(BulletUtils.explosion(
        new Victor(200 + Math.random() * (500 - 200), 200 + Math.random() * (500 - 200)),
        9,
        1.5, 0.5, 1, 0.5
    ), 2 + i*2, 2 + i*2 + 3.5);
}
bulletManager.start();



function animFrame() {
    requestAnimationFrame(animFrame);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    //bullet1.update();
    for (const bullet of Osupport) bullet.update();
    bulletManager.update();
    //rain.update();

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



