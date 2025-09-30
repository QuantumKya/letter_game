const level = {
    player: new Player(),

}

level.doStuff = () => {



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


let Isupport = BulletUtils.rainAttack(
    BulletUtils.LINE,
    150, CANVASW - 150,
    250,
    10, 15
);

const Battack = (count) => [...Array(count).keys()].map(
    (i) => BulletUtils.explosion(
        new Victor(100 + Math.random() * (600 - 100), 200 + Math.random() * (500 - 200)),
        10,
        0.5, 0.05, 0.8, 0.5
    )
);


const Rguns = (count) => [...Array(count).keys()].map(
    (i) => BulletUtils.Rgun(100 + Math.random() * (600 - 100), Math.random() > 0.5, 0.6, 3, 450, 15, level.player)
);


const wave1text = new TextObject('Wave 1', 0.5, 4);
wave1text.setPos(new Victor(CANVASW/2, CANVASH/2));
wave1text.setFontSize(100);
wave1text.setLetterMove((t) => {
    const scl = ((t) => {
        if (t <= (0.25) * FPS) {
            return new Victor(1, 1).multiplyScalar(1.5 * ((0.25 * FPS) - t) / 0.25 * FPS);
        }
        return new Victor(1, 1);
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
});
wave1text.setSpacing(35);
wave1text.setSpelling(2 / 5);


let bulletManager = new BulletManager();

//bulletManager.addBM(Isupport, 1.5);
Rguns(10).forEach((rgun, i) => bulletManager.addBM(rgun, 4 + 1 + i*1.25));
bulletManager.addBullet(Osupport, 4 + 5, 45);
Battack(20).forEach((batt, i) => bulletManager.addBullet(batt, 4 + 12 + 1.35 + i*1.25, 12 + 1.35 + i*1.25 + 1.85));
Rguns(10).forEach((rgun, i) => bulletManager.addBM(rgun, 4 + 30 + i*1.25));




level.Osupport = Osupport;
level.Isupport = Isupport;
level.bulletManager = bulletManager;
level.wave1 = wave1text;

level.bulletManager.start();

}

level.name = 'bros';

level.updateB = () => {
    level.bulletManager.update();
}

level.updateT = () => {
    level.wave1.update();
}


export default level;