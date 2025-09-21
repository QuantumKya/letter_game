/* Canvas Setup */

canvas.width = CANVASW;
canvas.height = CANVASH;

ctx.save();
ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.font = '30px monospace';
ctx.fillText('error: something crashed at the beginning', CANVASW / 2, CANVASH / 2);
ctx.restore();


const shaketext = (t) => {
    if (t % (5) === 0) {
        varRegister.deathtemp = {
            pos: new Victor(2*(1 - 2*Math.random()), 2*(1 - 2*Math.random())),
            rotation: 3*(1 - 2*Math.random()),
            scale: new Victor(1, 1)
        };
    }

    const { pos: p, rotation: r, scale: s } = varRegister.deathtemp;
    return BulletUtils.ORIENTPOSROT(p, r);
}

let alive = true;
window.addEventListener('die', (event) => {
    alive = false;
    CURRENTFRAME = 0;
    varRegister.deathtemp = BulletUtils.ORIENTZERO();

    const deathtext = new TextObject('You lost.', 0, 0);
    deathtext.setPos(new Victor(CANVASW / 2, CANVASH / 2));
    deathtext.setColor('white');
    deathtext.setFontSize(50);
    deathtext.setSpacing(15);
    deathtext.setSpelling(0.4);
    deathtext.setLetterMove(shaketext);

    const subm = [
        {tx: 'Was it too hard?', tm: 0},
        {tx: 'Sorry.', tm: 1.3},
        {tx: 'Well, you\'ll get better.', tm: 2},
        {tx: 'Try again.', tm: 2.8},
        {tx: 'Aww, don\'t give up!', tm: 6}
    ].map((sentence, i) => {
        const dt = new TextObject(sentence.tx, 2 + sentence.tm, 0);
        dt.setPos(new Victor(CANVASW / 2, CANVASH / 2 + 20 + 30 * (i+1)));
        dt.setColor('white');
        dt.setFontSize(25);
        dt.setSpacing(5);
        dt.setSpelling(0.4);
        //dt.setLetterMove(shaketext);
        return dt;
    });

    setInterval(() => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVASW, CANVASH);

        for (const dt of subm) dt.draw();
        deathtext.draw();
        CURRENTFRAME += 1;
    }, 1000 / 60);
})

/* Other Stuff */

const file = new URLSearchParams(window.location.search).get('level') ?? 'level';
let level = {};
import(`./${file}.js`)
    .then((module) => {
        level = module.default;

        level.doStuff();
        animFrame();
    })
    .catch((err) => console.error('Failed to load level:', err));



function animFrame() {
    const framestart = Date.now();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bullet Drawing
    level.updateB();

    // Player Damage Check
    level.player.checkForWhite();

    // Player Drawing
    level.player.update();
    level.player.draw();

    // UI Drawing
    ctx.font = '50px Roboto';
    ctx.fillStyle = 'white';
    ctx.fillText(`${level.player.health}/5`, 10, CANVASH - 20);

    level.updateT();


    const elapsed = Date.now() - framestart;
    if (elapsed < 1000 / FPS) setTimeout(() => { CURRENTFRAME += 1; console.log('underframe'); if (alive) requestAnimationFrame(animFrame); }, 1000 / FPS - elapsed);
    else { CURRENTFRAME += 1; console.log('overframe!!!!!'); if (alive) requestAnimationFrame(animFrame); }
}