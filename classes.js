const invincibility = 2;

//const swordlength = 0.4;

class Player {
    constructor() {
        this.pos = new Victor(CANVASW / 2, CANVASH / 2);
        this.vel = new Victor(0, 0);
        this.size = new Victor(30, 30);
        this.speed = 9;
        this.health = 5;

        this.hitTime = 0;
        this.invulnerable = false;

        /*
        this.slashing = false;
        this.slashTime = 0;
        this.slashAngle = 0;
        */


        this.keys = {
            directions: {
                left: {
                    pressed: false
                },
                right: {
                    pressed: false
                },
                up: {
                    pressed: false
                },
                down: {
                    pressed: false
                }
            }
        };
        this.moveMaps = [
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
            ["a", "d", "w", "s"]
        ];

        document.addEventListener("keydown", (event) => {
            let acceptedEntry = false;

            for (const moveMap of this.moveMaps) {
                let attempt = moveMap.indexOf(event.key);
                if (attempt !== -1) {
                    acceptedEntry = true;
                    this.keys.directions[["left", "right", "up", "down"][attempt]].pressed = true;
                }
            }
        });
        document.addEventListener("keyup", (event) => {
            let acceptedEntry = false;

            for (const moveMap of this.moveMaps) {
                let attempt = moveMap.indexOf(event.key);
                if (attempt !== -1) {
                    acceptedEntry = true;
                    this.keys.directions[["left", "right", "up", "down"][attempt]].pressed = false;
                }
            }
        });

        /*
        canvas.addEventListener('mousedown', (event) => {
            if (this.slashing) return;

            this.slashing = true;
            this.slashTime = CURRENTFRAME;
            this.slashAngle = getAngleToMouse(this.center.x, this.center.y);
            setTimeout(() => { this.slashing = false; }, swordlength * 1000 + 50);
        });
        */
    }
    
    get center() {
        return this.pos.clone().add(this.size.clone().divide(new Victor(2, 2)));
    }
    
    draw() {
        ctx.save();
        const opac = this.invulnerable ? Math.min(Math.cos((CURRENTFRAME - this.hitTime) * (6*Math.PI) / (invincibility * FPS)) * 0.4 + 0.75, 1) : 1;
        ctx.fillStyle = `rgba(255, 0, 0, ${opac})`;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        //this.drawSword();
        ctx.restore();
    }

    drawSword() {
        const innerR = 30;
        const outerR = 70;
        const arcStart = DEGRAD(-50);
        const arcEnd = DEGRAD(50);

        const angle = this.slashing ? this.slashAngle : getAngleToMouse(this.center.x, this.center.y);
        
        if (this.slashing) {
            ctx.restore();
            ctx.save();

            ctx.fillStyle = 'rgba(255, 80, 80, 0.6)';
            ctx.translate(this.center.x, this.center.y)
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(Math.cos(arcStart) * innerR, Math.sin(arcStart) * innerR);
            ctx.arc(0, 0, outerR, arcStart, arcEnd);
            ctx.lineTo(Math.cos(arcEnd) * innerR, Math.sin(arcEnd) * innerR);
            ctx.arc(0, 0, innerR, arcEnd, arcStart, true);
            ctx.fill();

            ctx.rotate(-angle);
            ctx.translate(-this.center.x, -this.center.y);
        }

        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.font = '40px Verdana';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        ctx.translate(this.center.x, this.center.y);
        if (this.slashing) {
            const t = (CURRENTFRAME - this.slashTime) / swordlength;
            ctx.rotate(angle + DEGRAD(90) + arcEnd * t + arcStart * (1-t));
        }
        else ctx.rotate(angle + DEGRAD(90));
        ctx.fillText('!', 0, -this.size.y * 1.3 / 2);
    }

    update() {
        let moveVec = Victor(0, 0);
        
        Object.entries(this.keys.directions).forEach((key, i) => {
            if (key[1].pressed) moveVec.add([LEFT, RIGHT, UP, DOWN][i]);
        });

        this.vel = (moveVec.length() !== 0 ? moveVec.normalize() : moveVec).multiply(new Victor(this.speed, this.speed));
        
        if (this.pos.x + this.vel.x + this.size.x > CANVASW) {
            this.vel.x = CANVASW - this.pos.x - this.size.x;
        }
        if (this.pos.x + this.vel.x < 0) {
            this.vel.x = -this.pos.x;
        }
        if (this.pos.y + this.vel.y + this.size.y > CANVASH) {
            this.vel.y = CANVASH - this.pos.y - this.size.y;
        }
        if (this.pos.y + this.vel.y < 0) {
            this.vel.y = -this.pos.y;
        }

        this.pos.add(this.vel);
    }

    takeDamage() {
        if (this.invulnerable) return;

        if (this.health === 1) { const die = new CustomEvent('die'); dispatchEvent(die); return; }

        this.health -= 1;
        this.invulnerable = true;
        setTimeout(() => {
            this.invulnerable = false;
        }, invincibility * 1000);
        this.hitTime = CURRENTFRAME;
        hitsound.play();
    }

    checkForWhite() {
        let found = false;
        for (let i = this.pos.x; i <= this.pos.x + this.size.x; i++) {
            for (let j = this.pos.y; j <= this.pos.y + this.size.y; j++) {
                const img = ctx.getImageData(i, j, 1, 1);
                const [r, g, b, a] = img.data;
                if (r+g+b+a === 1020) {
                    found = true;
                    const hitEvent = new CustomEvent('player-hit', { position: new Victor(i, j) });
                    window.dispatchEvent(hitEvent);
                    break;
                }
            }
            if (found) break;
        }

        if (found) this.takeDamage();
    }
}

class Bullet {
    /**
     * @param {function(number): {pos: Victor, rotation: number, scale: Victor}} moveFunc - Function to move the bullet, receives current time as argument, returns object of properties
     * @param {function(): void} drawFunc - Function to draw the bullet in its default orientation, (0, 0) as anchor (default rotation is facing RIGHT)
     */
    constructor(moveFunc, drawFunc) {
        this.moveInst = moveFunc;
        this.drawInst = drawFunc;
        this.startTime = -1;
        this.orientation = this.moveInst(0);
    }

    update() {
        this.orientation = this.moveInst(CURRENTFRAME - this.startTime);
        const [px, py] = this.orientation.pos.toArray();

        const outOfScope = (px > CANVASW + 100 || px < -100 || py > CANVASH + 100 || py < -100);

        if (!outOfScope) this.draw();
    }

    draw() {
        ctx.save();
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.strokeStyle = 'rgb(255, 255, 255)';

        ctx.translate(this.orientation.pos.x, this.orientation.pos.y);
        ctx.scale(this.orientation.scale.x, this.orientation.scale.y);
        ctx.rotate(this.orientation.rotation);

        this.drawInst();

        ctx.restore();
    }

    start() {
        this.startTime = CURRENTFRAME;
    }

    /**
     * Change scaling of the bullet.
     * @param {function(number): Victor} scale - scaling of `Bullet` as a function of time
     */
    changeScale(scale) {
        this.moveInst = (t) => { let orient = this.moveInst(); orient.scale.multiply(scale(t)); return orient; };
    }
}

class WarnedBullet extends Bullet {
    /**
     * @param {function(number): {pos: Victor, rotation: number, scale: Victor}} moveFunc - Function to move the bullet, receives current time as argument, returns object of properties
     * @param {function(): void} drawFunc - Function to draw the bullet in its default orientation, (0, 0) as anchor (default rotation is facing RIGHT)
     * @param {function(number): {pos: Victor, rotation: number, scale: Victor}} warnMove - Function to move the bullet warning
     * @param {function(number): void} warnDraw - Function to draw the bullet warning
     */
    constructor(moveFunc, drawFunc, warnMove, warnDraw) {
        super(moveFunc, drawFunc);
        this.warnMove = warnMove;
        this.warnDraw = warnDraw;
    }

    draw() {
        ctx.save();
        
        ctx.strokeStyle = 'red';

        const warnOrient = this.warnMove(CURRENTFRAME - this.startTime);
        
        ctx.translate(warnOrient.pos.x, warnOrient.pos.y);
        ctx.scale(warnOrient.scale.x, warnOrient.scale.y);
        ctx.rotate(warnOrient.rotation);
        
        this.warnDraw(CURRENTFRAME - this.startTime);
        
        ctx.restore();
        super.draw();
    }
}

class BulletGroup {
    /**
     * 
     * @param {Bullet[]} bullets - An array of `Bullet`s
     * @param {function(number): {pos: Victor, rotation: number, scale: Victor}} moveFunc - Move function for group of bullets
     */
    constructor(bullets, moveFunc) {
        this.bullets = bullets;
        this.moveInst = moveFunc;
        this.orientation = this.moveInst(0);
        this.startTime = -1;
    }

    update() {
        if (this.startTime === -1) return;
        this.orientation = this.moveInst(CURRENTFRAME - this.startTime);
        for (const blt of this.bullets) blt.orientation = blt.moveInst(CURRENTFRAME - blt.startTime);
        this.draw();
    }

    draw() {
        ctx.save();

        const { pos: p, rotation: r, scale: s } = this.orientation;
        ctx.translate(p.x, p.y);
        ctx.scale(s.x, s.y);
        ctx.rotate(r);

        for (const blt of this.bullets) blt.draw();
        ctx.restore();
    }

    start() {
        this.startTime = CURRENTFRAME;
        for (const blt of this.bullets) blt.start();
    }
}

class BulletManager {
    constructor() {
        this.pattern = [];
        this.startTime = -1;
        this.debugMode = false;
    }

    get length() {
        let max = 0;
        for (const blt of this.pattern) {
            max = Math.max(max, blt.end);
        }
        return max;
    }

    update() {
        if (this.startTime === -1) return;

        const time = CURRENTFRAME - this.startTime;
        for (const b of this.pattern) {
            if (time >= b.start * FPS && time <= b.end * FPS) {
                if (Array.isArray(b.bullet)) {
                    for (const bullet of b.bullet) {
                        if (bullet.startTime === -1) bullet.start();
                        bullet.update();
                    }
                }
                else if (b.bullet instanceof Bullet) {
                    if (b.bullet.startTime === -1) b.bullet.start();
                    b.bullet.update();
                }
                else if (b.bullet instanceof BulletManager) {
                    if (b.bullet.startTime === -1) b.bullet.start();
                    b.bullet.update();
                }
                else if (b.bullet instanceof BulletGroup) {
                    if (b.bullet.startTime === -1) b.bullet.start();
                    b.bullet.update();
                }
            }
        }
    }

    /**
     * Add `Bullet` or array of `Bullet`s to the pattern.
     * @param {Bullet | Bullet[] | BulletGroup} bullet - The `Bullet`(s) to activate
     * @param {number} startTime - the time to activate the bullet, in seconds
     * @param {number} endTime - the time to stop the bullet, in seconds
     */
    addBullet(bullet, startTime, endTime) {
        this.pattern.push({ bullet: bullet, start: startTime, end: endTime });
    }

    /**
     * Add `BulletManager` to the pattern.
     * @param {BulletManager} bm - The `BulletManager` to activate
     * @param {number} startTime - the time to activate the `BulletManager`, in seconds
     */
    addBM(bm, startTime) {
        this.pattern.push({ bullet: bm, start: startTime, end: startTime + bm.length });
    }

    start() {
        this.startTime = CURRENTFRAME;
    }

    debug() {
        this.debugMode = true;
    }
}

class BulletUtils {
    static DIAMOND = () => {
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(30, 0);
        ctx.lineTo(0, -15);
        ctx.lineTo(-30, 0);
        ctx.fill();
    }
    static CIRCLE = () => {
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, DEGRAD(360));
        ctx.fill();
    }
    static LINE = () => {
        ctx.fillRect(0, 3, 30, 6);
    }

    static ORIENT = (pos, rot, scl) => ({ pos: pos, rotation: rot, scale: scl });
    static ORIENTPOS = (pos) => ({ pos: pos, rotation: 0, scale: new Victor(1, 1) });
    static ORIENTPOSROT = (pos, rot) => ({ pos: pos, rotation: rot, scale: new Victor(1, 1) });
    static ORIENTZERO = () => ({ pos: new Victor(0, 0), rotation: 0, scale: new Victor(1, 1) });

    /**
     * Transforms a shape for drawing. Can be used for time-based orientation changes.
     * @param {function(): void} shape - shape to transform
     * @param {Victor} pos - translation
     * @param {number} rotation - rotation
     * @param {Victor} scale - scaling
     * @returns 
     */
    static transform(shape, pos = new Victor(0, 0), rotation = 0, scale = new Victor(1, 1)) {
        return () => {
            ctx.translate(pos.x, pos.y);
            ctx.scale(scale.x, scale.y);
            ctx.rotate(DEGRAD(rotation));
            shape();
        };
    }

    /**
     * Returns a `Bullet` movement function describing movement along a straight line.
     * @param {Victor} pos - position from which the line starts
     * @param {number} angle - angle of line in degrees
     * @param {number} speed - speed of travel in pixels per second
     * @returns movement function for `Bullet.prototype.constructor`
     */
    static linearTravel(start, angle, speed) {
        return (t) => {
            return {
                pos: new Victor(start.x + Math.cos(DEGRAD(angle)) * ((t/FPS) * speed), start.y + Math.sin(DEGRAD(angle)) * ((t/FPS) * speed)),
                rotation: DEGRAD(angle),
                scale: new Victor(1, 1)
            };
        };
    }
    
    /**
     * Returns a `Bullet` movement function describing movement along a circular path.
     * @param {Victor} origin - origin of path
     * @param {number} radius - radius of path
     * @param {number} startAngle - angle around circle to begin at, in degrees, clockwise from right.
     * @param {number} speed - speed of travel in degrees per second
     * @param {boolean} ccwise - counterclockwise travel toggle
     * @param {string} mode - one of `'inward'`, `'outward'`, or `'along'`.
     * @returns movement function for `Bullet.prototype.constructor`
     */
    static circularTravel(origin, radius, startAngle, speed, ccwise, mode) {
        return (t) => {
            const degangle = startAngle + (ccwise ? -1 : 1) * (t/FPS) * speed;
            const angle = DEGRAD(degangle);
            const rot = {
                inward: angle + DEGRAD(180),
                outward: angle,
                along: angle + (ccwise ? 1 : -1) * DEGRAD(90)
            }[mode];
            return {
                pos: new Victor(origin.x + Math.cos(angle) * radius, origin.y + Math.sin(angle) * radius),
                rotation: rot,
                scale: new Victor(1, 1)
            };
        };
    }

    /**
     * Returns a `BulletGroup` which move in unison around a circular path, equally spaced.
     * @param {function(): void} bullet - `Bullet` draw method to use for loop
     * @param {number} count - number of bullets in ring
     * @param {Victor} origin - origin of path
     * @param {number} radius - radius of path
     * @param {number} startAngle - angle around circle to begin at, in degrees, clockwise from right.
     * @param {number} speed - speed of travel in degrees per second
     * @param {boolean} ccwise - counterclockwise travel toggle
     * @param {string} mode - one of `'inward'`, `'outward'`, or `'along'`.
     * @returns `BulletGroup` of bullets in the ring
     */
    static circleGroup(bullet, count, origin, radius, startAngle, speed, ccwise, mode) {
        let bullets = [];
        for (let i = 0; i < 360; i += 360 / count) {
            bullets.push(new Bullet(
                BulletUtils.circularTravel(new Victor(0, 0), radius, i, speed, ccwise, mode),
                bullet
            ));
        }
        return new BulletGroup(bullets, (t) => BulletUtils.ORIENTPOSROT(origin, startAngle));
    }

    /**
     * Returns a `BulletManager` describing a rain attack, where bullets rain down in random positions.
     * @param {function(): void} bullet - `Bullet` draw method to use for loop
     * @param {number} leftSide - left bound of rain area
     * @param {number} rightSide - right bound of rain area
     * @param {number} speed - speed of drops in pixels per second
     * @param {number} length - duration of rain
     * @param {number} freq - drops per second
     * @param {number} angle - angle at which rain comes, set to 0 by default
     * @returns 
     */
    static rainAttack(bullet, leftSide, rightSide, speed, length, freq, angle = 0) {
        let manager = new BulletManager();
        for (let i = 0; i <= length; i += 1/freq + 0.3 * Math.random()) {
            const randx = leftSide + Math.random() * (rightSide - leftSide);
            manager.addBullet(new Bullet(BulletUtils.linearTravel(new Victor(randx, -20), angle + 90, speed + 50 * (1-Math.random())), bullet), i, length + CANVASH / speed);
        }
        return manager;
    }

    /**
     * 
     * @param {Victor} pos - origin of explosion
     * @param {number} size - radius of explosion, in 15x pixels
     * @param {number} warning - duration of warning, in seconds
     * @param {number} attack - duration of explosion growth, in seconds
     * @param {number} sustain - duration of the explosion staying at radius, in seconds
     * @param {number} decay - duration of decay, in seconds
     * @returns {BulletManager} `BulletManager` of bomb and explosion
     */
    static explosion(pos, size, warning, attack, sustain, decay) {
        const plose = new WarnedBullet((t) => {
            const scl = ((t) => {
                if (t <= warning * FPS) {
                    return 0;
                }
                else if (t <= (warning + attack) * FPS) {
                    return (t - warning * FPS) / (attack * FPS);
                }
                else if (t <= (warning + attack + sustain) * FPS) {
                    return 1 + 0.05 * Math.sin(((t - (warning + attack) * FPS) / (sustain * FPS)) * (6 * Math.PI));
                }
                else if (t <= (warning + attack + sustain + decay) * FPS) {
                    return 1 - ((t - (warning + attack + sustain) * FPS) / (decay * FPS));
                }
                else if (t > (warning + attack + sustain + decay) * FPS) {
                    return 0;
                }
            })(t);
            return {
                pos: pos,
                rotation: 0,
                scale: new Victor(size * scl, size * scl)
            };
        },
        BulletUtils.CIRCLE,
        (t) => {
            return {
                pos: pos,
                rotation: 0,
                scale: new Victor(1, 1)
            };
        },
        (t) => {
            if (t <= (warning + attack) * FPS) {
                ctx.beginPath();
                ctx.arc(0, 0, size * 15, 0, DEGRAD(360));
                ctx.stroke();
            }
        });

        const mag = 100;
        const thrw = 45;

        const bomb = new Bullet((t) => {
            if (t < thrw) {
                const side = pos.x > CANVASW / 2;
                const dist = side ? CANVASW - pos.x + 30 : pos.x + 30;
                const x = side ? CANVASW + 30 - (t/thrw) * dist : -30 + (t/thrw) * dist;
                const y = ((t/thrw) - 1) * (t/thrw) * 8 * mag + pos.y;

                return {
                    pos: new Victor(x, y),
                    rotation: 0,
                    scale: new Victor(2, 2)
                };
            }
            else {
                return {
                    pos: pos,
                    rotation: 0,
                    scale: new Victor(2, 2)
                };
            }
        },
        () => {
            ctx.drawImage(bombimage, -8, -8, 16, 16);
        });

        const bm = new BulletManager();
        bm.addBullet(bomb, 0, thrw / FPS + 1.5);
        bm.addBullet(plose, thrw / FPS, thrw / FPS + warning + attack + sustain + decay);
        return bm;
    }

    /**
     * 
     * @param {number} height - Y position of gun
     * @param {boolean} side - true = right, false = left
     * @param {number} wait - amount of time before shooting, in seconds
     * @param {number} bullets - number of bullets to shoot
     * @param {number} speed - speed of bullets in pixels per second
     * @param {number} spread - spread, in degrees
     * @param {Player} player - the player.
     */
    static Rgun(height, side, wait, bullets, speed, spread, player) {
        const gunpos = new Victor(side ? CANVASW - 10 : 10, height);
        const scl = new Victor(side ? 1 : -1, 1);
        const anglefind = (t) => {
            if (t < wait * FPS) {
                let angle = player.center.clone().subtract(gunpos).horizontalAngleDeg();
                return angle;
            }
            else if (t === Math.floor(wait * FPS)) {
                varRegister.Rgun = player.center.clone().subtract(gunpos).horizontalAngleDeg();
                return varRegister.Rgun;
            }
            else if (t < (wait + 0.10) * FPS) {
                return varRegister.Rgun + (side ? 1 : -1) * 10 * Math.sin((t - wait * FPS) * (Math.PI/2) / (0.10 * FPS));
            }
            else if (t < (wait + 0.5) * FPS) {
                return varRegister.Rgun + (side ? 1 : -1) * 10 * Math.sin(Math.PI / 2 + (t - (wait + 0.1) * FPS) * (Math.PI/2) / (0.4 * FPS));
            }
            else {
                return varRegister.Rgun;
            }
        };
        const posfind = (t) => {
            if (t < 0.2 * FPS) {
                const osc = Math.sin((t - 0.2 * FPS) / (0.2 * FPS) * (Math.PI / 2));
                return new Victor(osc * (side ? -80 : 80), 0);
            }

            if (t > (wait + 0.5) * FPS && t <= (wait + 0.7) * FPS) {
                const osc = -Math.cos((t - (wait + 0.5) * FPS) / (0.2 * FPS) * (Math.PI / 2));
                return new Victor((1 + osc) * (side ? 80 : -80), 0);
            }
            
            return new Victor(0, 0);
        };

        const gun = new WarnedBullet(
            (t) => {
                return {
                    pos: gunpos.clone().add(posfind(t)),
                    rotation: DEGRAD(!side ? -anglefind(t) + 90 : (360 - (-anglefind(t) + 90)) % 360),
                    scale: scl
                };
            },
            () => {
                ctx.font = '84px Roboto';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText('r', 0, 0);
            },
            (t) => BulletUtils.ORIENTPOSROT(gunpos, DEGRAD(anglefind(t))),
            (t) => {
                if (t > (wait + 0.15) * FPS || t < 0.2 * FPS) return;

                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.moveTo(30, 5 * (side ? 1 : -1));
                ctx.lineTo(1000, 5 * (side ? 1 : -1));
                ctx.stroke();
            }
        );

        const bm = new BulletManager();
        bm.addBullet(gun, 0, wait + 0.7);

        Object.defineProperty(bm, 'length', {
            get: function() {
                return wait + (CANVASW * Math.sqrt(2) / speed);
            }
        });

        bm.update = function() {
            if (this.startTime === -1) return;
            const time = CURRENTFRAME - this.startTime;
            BulletManager.prototype.update.call(this);

            if (time === Math.floor((wait + 0.1) * FPS)) {
                for (let i = 0; i < bullets; i++) {
                    const angle = varRegister.Rgun;
                    const spreadAngle = angle + (0.5 - Math.random()) * spread;
                    this.addBullet(
                        new Bullet(
                            BulletUtils.linearTravel(
                                gunpos.clone().add(new Victor(70*Math.cos(DEGRAD(angle)), 70*Math.sin(DEGRAD(angle)))).add(new Victor(-10*Math.sin(DEGRAD(angle)), 10*Math.cos(DEGRAD(angle)))),
                                spreadAngle, speed),
                            BulletUtils.DIAMOND
                        ),
                    wait + 0.1, wait + CANVASW * Math.sqrt(2) / speed);
                }
            }
        };

        return bm;
    }

    static Spath(p1, p2, p3, p4, wait) {

        const speed = 600;
        const { table, length } = MathUtils.bézierArcTable(p1, p2, p3, p4, 150);
        const traveltime = length / speed;

        const path = new WarnedBullet(
            (t) => {
                const tp = MathUtils.bézierDistanceTo(length * t / (traveltime * FPS), { table, length });

                const pos = ((t) => {
                    if (t <= wait * FPS) {
                        return MathUtils.bézierAt(p1, p2, p3, p4, 0);
                    }
                    else if (t <= (wait + traveltime + 0.2) * FPS) {
                        return MathUtils.bézierAt(p1, p2, p3, p4, tp);
                    }
                    else if (t > (wait + traveltime + 0.2) * FPS) {
                        return MathUtils.bézierAt(p1, p2, p3, p4, 1.1);
                    }
                })(t);
                
                const rot = ((t) => {
                    if (t <= wait * FPS) return 0;
                    else if (t <= (wait + traveltime + 0.2) * FPS) {
                        return 90 - MathUtils.bézierDerivAt(p1, p2, p3, p4, tp).horizontalAngleDeg();
                    }
                    else if (t > (wait + traveltime + 0.2) * FPS) {
                        return 90 - MathUtils.bézierDerivAt(p1, p2, p3, p4, 1).horizontalAngleDeg();
                    }
                    return 90 - MathUtils.bézierDerivAt(p1, p2, p3, p4, 1).horizontalAngleDeg();
                })(t);

                return BulletUtils.ORIENTPOSROT(pos, rot);
            },
            () => {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('S', 0, 0);
            },
            BulletUtils.ORIENTZERO,
            (t) => {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
                ctx.stroke();
            }
        );




        const bm = new BulletManager();

        bm.addBullet(path, 0, wait + traveltime + 0.2);
        return bm;
    }
}

/* Text Making */

class TextObject {
    /**
     * 
     * @param {string} text 
     * @param {number} start 
     * @param {number} end 
     */
    constructor(text, start, end) {
        this.text = text;
        this.start = start;
        this.end = end;

        this.position = new Victor(0, 0);
        this.color = 'white';

        this.letterMove = BulletUtils.ORIENTZERO;
        this.fontSize = 64;
        this.spacing = 4;
        this.spelled = false;
        this.spellSpd = -1;
    }

    get wordWidth() {
        ctx.save();
        ctx.font = `${this.fontSize} Roboto`;
        const w = ctx.measureText(this.text).width;
        ctx.restore();
        return w;
    }

    get letterWidth() {
        ctx.save();
        const arr = [...this.text].map((char) => {
            ctx.font = `${this.fontSize} Roboto`;
            return ctx.measureText(char).width;
        });
        ctx.restore();
        return arr;
    }

    update() {
        if (CURRENTFRAME < this.start * FPS || CURRENTFRAME > this.end * FPS) return;
        this.draw();
    }

    draw() {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);

        ctx.font = `${this.fontSize}px Roboto`;
        ctx.textBaseline = 'middle';
        
        this.text.split('').forEach((char, i) => {
            if (this.spelled) if (CURRENTFRAME - this.start * FPS < FPS * this.spellSpd * i / this.text.length) return;

            const length = this.wordWidth + this.spacing * (this.text.length - 1);
            const offset = i * this.spacing + (i === 0 ? 0 : this.letterWidth.slice(0, i).reduce((a,b)=>a+b)) - length / 2;

            const { pos: p, rotation: r, scale: s } = this.letterMove(CURRENTFRAME - this.start * FPS);
            ctx.translate(p.x + offset, p.y);
            ctx.scale(s.x, s.y);
            ctx.rotate(DEGRAD(r));

            ctx.fillStyle = this.color;
            ctx.fillText(char, 0, 0);

            ctx.rotate(-DEGRAD(r));
            ctx.scale(1/s.x, 1/s.y);
            ctx.translate(-p.x - offset, -p.y);
        });

        ctx.restore();
    }

    /**
     * @param {Victor} position 
     */
    setPos(position) { this.position = position; }
    setColor(color) { this.color = color; }
    /**
     * @param {function(number): {pos: Victor, rotation: number, scale: Victor}} func 
     */
    setLetterMove(func) { this.letterMove = func; }
    setFontSize(size) { this.fontSize = size; }
    setSpacing(space) { this.spacing = space; }
    /**
     * @param {number} time letters per second
     */
    setSpelling(time) { this.spelled = true; this.spellSpd = time; }
}

/* ------ Math ------ */

class Bézier {
    /**
     * @param  {...Victor} p 
     */
    constructor(...p) {
        this.pts = p;
    }

    get order() { return this.pts.length - 1; }

    get derivative() {
        const d = this.pts.map((pt, i) => {
            if (i === this.pts.length-1) return new Victor(0, 0);
            return this.pts[i+1].clone().subtract(pt).multiply(new Victor(this.order, this.order));
        });
        d.pop();
        return d;
    }
}

class MathUtils {
    static nCk(n, k) {
        if (Number.isNaN(n) || Number.isNaN(k)) return NaN;
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k === 1 || k === n - 1) return n;
        if (n - k < k) k = n - k;

        let res = n;
        for (let i = 2; i <= k; i++) res *= (n - i + 1) / i;
        return Math.round(res);
    };

    static pascalArr(row) {
        return [...Array.from(row)].map(MathUtils.nCk);
    }

    /**
     * Get the point on a Bézier curve at time `t`.
     * @param {Bézier} bzr - The Bézier.
     * @param {number} t - Parametrization variable, ideally between 0 and 1.
     * @returns Position of point on Bézier curve.
     */
    static bézierAt(bzr, t) {
        const r = 1 - t;
        
        const px = MathUtils.pascalArr(bzr.pts.length).map((coef, i) => {
            return coef * Math.pow(r, bzr.pts.length-i) * Math.pow(t, i) * bzr.pts[i].x;
        });
        const py = MathUtils.pascalArr(bzr.pts.length).map((coef, i) => {
            return coef * Math.pow(r, bzr.pts.length-i) * Math.pow(t, i) * bzr.pts[i].y;
        });
        return new Victor(px, py);
    }

    /**
     * Get the derivative of a Bézier curve at time `t`.
     * @param {Bézier} bzr - The Bézier.
     * @param {number} t - Parametrization variable, ideally between 0 and 1.
     * @returns Derivative vector of Bézier curve.
     */
    static bézierTan = (bzr, t) => MathUtils.bézierAt(bzr.derivative, t).normalize();

    static bézierLength(bzr, t) {
        const n = 100;
        const dt = t / n;
        let length = 0;

        for (let i = 0; i <= n; i++) {
            const coef = (i === 0 || i === n) ? 1 : (i % 2 === 0 ? 2 : 4);
            length += coef * MathUtils.bézierAt(bzr.derivative, i * dt).length();
        }
        return length * dt / 3;
    }

    /**
     * Get the arc parametrization time table of a Bézier curve.
     * @param {Bézier} bzr - The Bézier.
     * @param {number} presc - Precision of length approximation.
     * @returns 
     */
    static bézierArcTable(bzr, presc = 100) {
        const table = [];
        let tlength = 0;
        let prevPnt = MathUtils.bézierAt(bzr, 0);

        for (let i = 1; i <= presc; i++) {
            const t = i / presc;
            const pnt = MathUtils.bézierAt(bzr, t);
            const seg = pnt.clone().subtract(prevPnt).length();
            tlength += seg;
            table.push({ t: t, length: tlength });
            prevPnt = pnt;
        }

        return { table: table, length: tlength };
    }

    /**
     * Get an approximation of `t` for a given distance along the curve.
     * @param {number} dist - The distance along the Bézier curve.
     * @param {{table: {t: number; length: number;}[]; length: number;}} arcTable - arc-length time table for Bézier curve.
     * @returns The approximation of `t`.
     */
    static bézierDistanceTo(dist, arcTable) {
        const { table, tl } = arcTable;

        if (dist <= 0) return 0;
        if (dist >= tl) return 1;

        let l = 0, h = table.length - 1;
        while (l < h) {
            const m = Math.floor((l + h) / 2);
            if (table[m].length < dist) l = m + 1;
            else h = m;
        }

        const under = table[l-1] || { t: 0, length: 0 };
        const over = table[l];
        const seg = over.length - under.length;
        const seginter = (dist - under.length) / seg;

        return under.t + seginter * (over.t - under.t);
    }
}