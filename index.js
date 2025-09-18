/* Canvas Setup */

canvas.width = CANVASW;
canvas.height = CANVASH;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);



/* Other Stuff */

const player = new Player();

const Oradius = 200;
const Obegin = 5;
const Oend = 45;
let Osupport = BulletUtils.circleGroup(
    BulletUtils.CIRCLE,
    25,
    new Victor(CANVASW / 2, CANVASH / 2),
    Oradius,
    0, 100, true,
    'inward'
);
const Omv = Osupport.moveInst;
Osupport.moveInst = (t) => {
    let scl = 1;
    if (t < 1.5 * FPS) {
        const f = -Math.sin((Math.PI / 2) * (t / (1.5 * FPS)));
        scl = 1 + (CANVASW + 200) / Oradius * (1 + f);
    }
    else if (t < (Oend - Obegin - 1.5) * FPS) {
        scl = 1;
    }
    else {
        const f = -Math.cos((Math.PI / 2) * ((t - (Oend - Obegin - 1.5) * FPS) / (1.5 * FPS)));
        scl = 1 + (CANVASW + 200) / Oradius * (1 + f);
    }
    
    const or = Omv(t);
    return {
        pos: or.pos,
        rotation: or.rotation,
        scale: new Victor(scl, scl)
    };
}

let bulletManager = new BulletManager();

let Isupport = BulletUtils.rainAttack(
    BulletUtils.LINE,
    150, CANVASW - 150,
    250,
    10, 15
);

const Battack = (count) => [...Array(count).keys()].map(
    (i) => BulletUtils.explosion(
        new Victor(200 + Math.random() * (500 - 200), 200 + Math.random() * (500 - 200)),
        9,
        0.5, 0.05, 0.8, 0.5
    )
);


const Rguns = (count) => [...Array(count).keys()].map(
    (i) => BulletUtils.Rgun(100 + Math.random() * (600 - 100), Math.random() > 0.5, 0.7, 3, 600, 10, player)
);



//bulletManager.addBM(Isupport, 1.5);
Rguns(10).forEach((rgun, i) => bulletManager.addBM(rgun, 1 + i*1.25));
bulletManager.addBullet(Osupport, 5, 45);
Battack(20).forEach((batt, i) => bulletManager.addBullet(batt, 12 + 1.35 + i*1.25, 12 + 1.35 + i*1.25 + 1.85));
Rguns(10).forEach((rgun, i) => bulletManager.addBM(rgun, 30 + i*1.25));

bulletManager.start();



function animFrame() {
    const framestart = Date.now();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    bulletManager.update();

    // Player Damage Check
    player.checkForWhite();

    // Player Drawing
    player.update();
    player.draw();

    // UI Drawing
    ctx.font = '50px Roboto';
    ctx.fillStyle = 'white';
    ctx.fillText(`${player.health}/5`, 10, 680);


    const elapsed = Date.now() - framestart;
    if (elapsed < 1000 / FPS) setTimeout(() => { CURRENTFRAME += 1; console.log('underframe'); requestAnimationFrame(animFrame); }, 1000 / FPS - elapsed);
    else { CURRENTFRAME += 1; console.log('overframe!!!!!'); requestAnimationFrame(animFrame); }
}
animFrame();



/* Event Listeners */



