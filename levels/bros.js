const level = {
    player: new Player(),

    updateB: () => {
        level.bm.update();
    },
    updateT: () => {
        for (const wave of level.waves) wave.update();
    },

    name: 'bros',

    doStuff: () => {

        let bmw1 = new BulletManager();

        //bulletManager.addBM(Isupport, 1.5);
        for (let i = 0; i < 10; i++) {
            const rgun = BulletUtils.Rgun(100 + Math.random() * (600 - 100), Math.random() > 0.5, 0.6, 3, 450, 15, level.player);
            bmw1.addBM(rgun, i*1.25);
        }
        for (let i = 0; i < 10; i++) {
            const buffer = 100;
            const batt = BulletUtils.explosion(
                new Victor(buffer + Math.random() * (CANVASW - buffer), buffer + Math.random() * (CANVASH - buffer)),
                10,
                0.5, 0.05, 0.8, 0.5
            );
            bmw1.addBullet(batt, 1.3 + i*1.25, 1.3 + i*1.25 + batt.length);
        }

        let bmw2 = new BulletManager();

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
                return new Victor(Math.sin(ang), Math.cos(ang)).multiplyScalar(200);
            })(t);
            
            const or = Omv(t);
            return {
                pos: or.pos.clone().add(p),
                rotation: or.rotation,
                scale: new Victor(scl, scl)
            };
        }

        bmw2.addBullet(Osupport, 1 + Math.random() * 4, 10);

        for (let i = 0; i < 4; i++) {
            const spath = BulletUtils.Spath(
                new Victor(0, 600),
                new Victor(CANVASW + 500, 450),
                new Victor(-500, 300),
                new Victor(CANVASW, 100),
                0.5,
                6
            );
            bmw2.addBM(spath, i*2.5);
        }



        const wave1text = wavetext(1, 0);
        const wave2text = wavetext(2, 17);
        const wintext = new TextObject('You Win!', 30, 50);
        wintext.setPos(new Victor(CANVASW/2, CANVASH/2));
        wintext.setFontSize(100);
        wintext.setSpacing(20);
        wintext.setTextMove(textf);
        level.waves = [wave1text, wave2text, wintext];


        let bulletManager = new BulletManager();
        bulletManager.addBM(bmw1, 0+2);
        bulletManager.addBM(bmw2, 17+2);
        level.bm = bulletManager;

        level.bm.start();
    }
}



export default level;