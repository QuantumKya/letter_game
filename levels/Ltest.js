const level = {
    player: new Player()
};

level.doStuff = () => {
    
    const Lbarrage = (count) => [...Array(count).keys()].map(
        (i) => {
            const tf = Math.random() > 0.5;
            const [p1, p2] = [0, 1].map(a => {
                if (a) return tf ? new Victor(0, 150 + Math.random()*(CANVASH-150)) : new Victor(CANVASW, 150 + Math.random()*(CANVASH-150));
                else return tf ? new Victor(CANVASW, 150 + Math.random()*(CANVASH-150)) : new Victor(0, 150 + Math.random()*(CANVASH-150));
            });
            return BulletUtils.Ldash(0.4, p1, p2, 1400);
        }
    );

    const bm = new BulletManager();
    Lbarrage(5).forEach((blt, i) => bm.addBullet(blt, 0.5 + 1*i, 3 + 1*i));

    const label = new TextObject('L attack test', 0.5, 0);
    label.setPos(new Victor(CANVASW / 2, 75));
    label.setFontSize(48);
    label.setSpelling(12);

    level.bm = bm;
    level.bm.start();
    level.label = label;
}

level.updateB = () => {
    level.bm.update();
}

level.updateT = () => {
    level.label.draw();
}

export default level;