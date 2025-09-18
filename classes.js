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

        const gun = new WarnedBullet(
            (t) => {
                return {
                    pos: gunpos,
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
                if (t > (wait + 0.3) * FPS) return;

                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.moveTo(30, 5 * (side ? 1 : -1));
                ctx.lineTo(1000, 5 * (side ? 1 : -1));
                ctx.stroke();
            }
        );

        const bm = new BulletManager();
        bm.addBullet(gun, 0, wait + 0.6);

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
                            BulletUtils.linearTravel(gunpos, spreadAngle, speed),
                            BulletUtils.DIAMOND
                        ),
                    wait + 0.1, wait + CANVASW * Math.sqrt(2) / speed);
                }
            }
        };

        return bm;
    }
}