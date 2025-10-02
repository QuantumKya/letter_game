const level = {
    player: new Player(),
    bm: new BulletManager(),

    updateB: () => {
        level.bm.update();
    },
    updateT: () => {
        for (const wave of level.waves) wave.update();
    },

    name: 'silo',

    doStuff: () => {

        let bmw1 = new BulletManager();

        let Isupport = BulletUtils.rainAttack(
            BulletUtils.LINE,
            150, CANVASW - 150,
            250,
            12, 15
        );

        bmw1.addBM(Isupport, 1);




        bulletManager.addBullet(Osupport, 19 + 3, 32);
        Spaths(4).forEach((path, i) => bulletManager.addBM(path, 19 + i*2.5));

        const wave1text = wavetext(1, 0);
        const wave2text = wavetext(2, 17);



        level.bulletManager = bulletManager;
        level.waves = [wave1text, wave2text, wintext];

        level.bulletManager.start();
    }
}



export default level;