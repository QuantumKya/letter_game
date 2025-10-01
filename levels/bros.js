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

    const p = ((t) => {
        const ang = Math.PI / 2 * (t / FPS);
        return new Victor(Math.sin(ang), Math.cos(ang)).multiplyScalar(200);
    })(t);
    
    const or = Omv(t);
    return {
        pos: or.pos.clone().add(p),
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

const Spaths = (count) => [...Array(count).keys()].map(
    (i) => {
        const path = BulletUtils.Spath(
            new Victor(0, 600),
            new Victor(CANVASW + 500, 450),
            new Victor(-500, 300),
            new Victor(CANVASW, 100),
            0.5,
            6
        );

        for (const b of path.pattern) {
            const mf = b.moveInst;
            b.moveInst = (t) => {
                const { p, r, s } = mf(t);
                return {
                    pos: p,
                    rotation: (r + Math.floor(Math.random() * 360)) % 360,
                    scale: s
                }
            }
        }

        return path;
    }
);

const textf = (t) => {
    const scl = ((t) => {
        if (t <= (0.25) * FPS) {
            return new Victor(1, 1).multiplyScalar(1 + 0.5 * ((0.25 * FPS) - t));
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
let bulletManager = new BulletManager();



const wave1text = new TextObject('Wave 1', 0.2, 2);
wave1text.setPos(new Victor(CANVASW/2, CANVASH/2));
wave1text.setFontSize(100);
wave1text.setSpacing(20);
wave1text.setTextMove(textf);

//bulletManager.addBM(Isupport, 1.5);
Battack(10).forEach((batt, i) => bulletManager.addBullet(batt, 2 + 1.35 + i*1.25, 2 + 1.35 + i*1.25 + 1.85));
Rguns(10).forEach((rgun, i) => bulletManager.addBM(rgun, 2 + i*1.25));


const wave2text = new TextObject('Wave 2', 17.2, 19);
wave2text.setPos(new Victor(CANVASW/2, CANVASH/2));
wave2text.setFontSize(100);
wave2text.setSpacing(20);
wave2text.setTextMove(textf);

bulletManager.addBullet(Osupport, 19 + 3, 32);
Spaths(4).forEach((path, i) => bulletManager.addBM(path, 19 + i*2.5));


const wintext = new TextObject('You Win!', 33, 50);
wintext.setPos(new Victor(CANVASW/2, CANVASH/2));
wintext.setFontSize(100);
wintext.setSpacing(20);
wintext.setTextMove(textf);





level.Osupport = Osupport;
level.Isupport = Isupport;
level.bulletManager = bulletManager;
level.waves = [wave1text, wave2text, wintext];

level.bulletManager.start();

}

level.name = 'bros';

level.updateB = () => {
    level.bulletManager.update();
}

level.updateT = () => {
    for (const wave of level.waves) wave.update();
}


export default level;