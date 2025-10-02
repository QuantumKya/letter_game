const level = {
    player: new Player(),

    name: 'silo',

    doStuff: () => {

        let bmw1 = new BulletManager();

        let Isupport = BulletUtils.rainAttack(
            BulletUtils.LINE,
            0, CANVASW,
            275,
            8.5, 20, 5*(0.5 - Math.random())*2
        );

        bmw1.addBM(Isupport, 1);
        for (let i = 0; i < 4; i++) {
            const spath = BulletUtils.Spath(
                new Victor(0, 600),
                new Victor(CANVASW + 500, 450),
                new Victor(-500, 300),
                new Victor(CANVASW, 100),
                0.5,
                6
            );
            bmw1.addBM(spath, i*2.5);
        }

        let bmw2 = new BulletManager();

        const r1 = Math.random()*2;
        const Oradius = 250;
        const Obegin = r1;
        const Oend = 9.5+r1;
        let Osupport = BulletUtils.circleGroup(
            BulletUtils.CIRCLE,
            30,
            new Victor(CANVASW / 2, CANVASH / 2),
            Oradius,
            0, 100, true,
            'inward'
        );
        const Omv = Osupport.moveInst;
        Osupport.moveInst = (t) => {
            const wait = 3;
            let scl = 1;
            if (t < wait * FPS) {
                const f = -Math.sin((Math.PI / 2) * (t / (wait * FPS)));
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
                return new Victor(Math.sin(ang), Math.cos(ang)).multiplyScalar(100);
            })(t);
            
            const or = Omv(t);
            return {
                pos: or.pos.clone().add(p),
                rotation: or.rotation,
                scale: new Victor(scl, scl)
            };
        }
        
        bmw2.addBullet(Osupport, Obegin, Oend);
        for (let i = 0; i < 10; i++) {
            for (let c = 0; c < 2; c++) {
                const [p1, p2] = [0, 1].map(a => {
                    if (a) return c ? new Victor(0, 150 + Math.random()*(CANVASH-150)) : new Victor(CANVASW, 150 + Math.random()*(CANVASH-150));
                    else return c ? new Victor(CANVASW, 150 + Math.random()*(CANVASH-150)) : new Victor(0, 150 + Math.random()*(CANVASH-150));
                });
                bmw2.addBullet(BulletUtils.Ldash(0.4, p1, p2, 1400), 0.3 + i*1, 2.5 + i*1);
            }
        }

        let bmw3 = new BulletManager();
        
        const r2 = Math.random()*2;
        const Oradius2 = CANVASW / 2 - 50;
        const Obegin2 = 6+r2;
        const Oend2 = 6+7+r2;
        let Osupport2 = BulletUtils.circleGroup(
            BulletUtils.CIRCLE,
            40,
            new Victor(CANVASW / 2, CANVASH / 2),
            Oradius2,
            0, 100, true,
            'inward'
        );
        const Omv2 = Osupport2.moveInst;
        Osupport2.moveInst = (t) => {
            const wait = 1.5;
            let scl = 1;
            if (t < wait * FPS) {
                const f = -Math.sin((Math.PI / 2) * (t / (wait * FPS)));
                scl = 1 + (CANVASW + 200) / Oradius2 * (1 + f);
            }
            else if (t < (Oend2 - Obegin2 - 1.5) * FPS) {
                scl = 1;
            }
            else {
                const f = -Math.cos((Math.PI / 2) * ((t - (Oend2 - Obegin2 - 1.5) * FPS) / (1.5 * FPS)));
                scl = 1 + (CANVASW + 200) / Oradius2 * (1 + f);
            }
            
            const or = Omv2(t);
            return {
                pos: or.pos,
                rotation: or.rotation,
                scale: new Victor(scl, scl)
            };
        }

        bmw3.addBullet(Osupport2, Obegin2, Oend2);
        for (let i = 0; i < 10; i++) {
            for (let c = 0; c < 2; c++) {
                const [p1, p2] = [0, 1].map(a => {
                    if (a) return c ? new Victor(0, 150 + Math.random()*(CANVASH-150)) : new Victor(CANVASW, 150 + Math.random()*(CANVASH-150));
                    else return c ? new Victor(CANVASW, 150 + Math.random()*(CANVASH-150)) : new Victor(0, 150 + Math.random()*(CANVASH-150));
                });
                bmw3.addBullet(BulletUtils.Ldash(0.4, p1, p2, 1400), 0.3 + i*1, 2.5 + i*1);
            }
        }

        for (let i = 0; i < 3; i++) {
            const spath = BulletUtils.Spath(
                new Victor(0, 600),
                new Victor(CANVASW + 500, 450),
                new Victor(-500, 300),
                new Victor(CANVASW, 100),
                0.5,
                6
            );
            bmw3.addBM(spath, i*5);
        }

        let Isupport2 = BulletUtils.rainAttack(
            BulletUtils.LINE,
            0, CANVASW,
            275,
            5, 20, 5*(0.5 - Math.random())*2
        );

        bmw3.addBM(Isupport2, 1);



        const wave1text = wavetext(1, 0);
        const wave2text = wavetext(2, 12);
        const wave3text = wavetext(3, 25.5);
        const wintext = new TextObject('You Win!', 40, 100);
        wintext.setPos(new Victor(CANVASW/2, CANVASH/2));
        wintext.setFontSize(100);
        wintext.setSpacing(20);
        wintext.setLetterMove(textf);
        level.waves = [wave1text, wave2text, wave3text, wintext];


        let bulletManager = new BulletManager();
        bulletManager.addBM(bmw1, 0+2);
        bulletManager.addBM(bmw2, 12+2);
        bulletManager.addBM(bmw3, 25.5+2);
        level.bm = bulletManager;

        level.bm.start();
    }
}

level.updateB = () => {
    level.bm.update();
}

level.updateT = () => {
    for (const wave of level.waves) wave.update();
}



export default level;