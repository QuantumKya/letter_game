const level = {
    player: new Player()
};

level.doStuff = () => {
    
    const Lattack = BulletUtils.Lwall(1, 9.5, 0.5, 90);

    const bm = new BulletManager();
    bm.addBM(Lattack, 2);

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