const level = {
    player: new Player()
};

level.doStuff = () => {
    
    const Sattack = BulletUtils.Spath(
        new Victor(0, 600),
        new Victor(550, 450),
        new Victor(150, 300),
        new Victor(700, 100),
        0.5
    );

    const bm = new BulletManager();
    bm.addBM(Sattack, 2);

    const label = new TextObject('S attack test', 0.5, 0);
    label.setPos(new Victor(CANVASW / 2, 75));
    label.setFontSize(48);
    label.setSpelling(0.2);

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