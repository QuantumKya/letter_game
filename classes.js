const invincibility = 2000;

class Player {
    constructor() {
        this.pos = new Victor(0, 0);
        this.vel = new Victor(0, 0);
        this.size = new Victor(50, 50);
        this.speed = 3;
        this.health = 5;
        this.timeSlot = 0;
        this.invulnerable = false;


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
    }
    
    draw() {
        ctx.save();
        const opac = this.invulnerable ? Math.min(Math.cos((Date.now() - this.timeSlot) / (invincibility / (6*Math.PI))) * 0.4 + 0.75, 1) : 1;
        ctx.fillStyle = `rgba(255, 0, 0, ${opac})`;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        ctx.restore();
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
        console.log("taken damage");
        if (this.invulnerable) return;
        this.health -= 2;
        this.invulnerable = true;
        setTimeout(() => {
            this.invulnerable = false;
        }, invincibility);
        this.timeSlot = Date.now();
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
        this.initTime = 0;
        this.orientation = this.moveInst(0);
        this.outOfScope = false;
    }

    update() {
        this.orientation = this.moveInst(Date.now() - this.initTime);
        const [px, py] = this.orientation.pos.toArray();

        this.outOfScope = (px > CANVASW + 100 || px < -100 || py > CANVASH + 100 || py < -100);

        if (!this.outOfScope) this.draw();
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

    begin() {
        this.initTime = Date.now();
    }

    changeScale(scale) {
        this.moveInst = (t) => { let orient = this.moveInst(); orient.scale = scale; };
    }
}

class BulletManager {
    constructor() {
        this.pattern = [];
        this.startTime = 0;
    }

    update() {
        if (this.startTime === 0) return;

        const time = Date.now() - this.startTime;
        for (const b of this.pattern) {
            if (time >= b.start * 1000 && time <= b.end * 1000) {
                if (Array.isArray(b.bullet)) {
                    for (const bullet of b.bullet) bullet.update();
                }
                else b.bullet.update();
            }
        }
    }

    /**
     * Add `Bullet` or array of `Bullet`s to the pattern.
     * @param {Bullet | Bullet[]} bullet - The `Bullet`(s) to activate
     * @param {number} startTime - the time to activate the bullet, in seconds
     * @param {number} endTime - the time to stop the bullet, in seconds
     */
    addBullet(bullet, startTime, endTime) {
        this.pattern.push({ bullet: bullet, start: startTime, end: endTime });
    }

    start() {
        this.startTime = Date.now();
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
                pos: new Victor(start.x + Math.cos(DEGRAD(angle)) * ((t/1000) * speed), start.y + Math.sin(DEGRAD(angle)) * ((t/1000) * speed)),
                rotation: angle,
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
            const degangle = startAngle + (ccwise ? -1 : 1) * (t/1000) * speed;
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
     * Returns an array of `Bullet`s which move in unison around a circular path, equally spaced.
     * @param {function(): void} bullet - `Bullet` draw method to use for loop
     * @param {number} count - number of bullets in ring
     * @param {Victor} origin - origin of path
     * @param {number} radius - radius of path
     * @param {number} startAngle - angle around circle to begin at, in degrees, clockwise from right.
     * @param {number} speed - speed of travel in degrees per second
     * @param {boolean} ccwise - counterclockwise travel toggle
     * @param {string} mode - one of `'inward'`, `'outward'`, or `'along'`.
     * @returns array of `Bullet`s in the ring
     */
    static circleGroup(bullet, count, origin, radius, startAngle, speed, ccwise, mode) {
        let bullets = [];
        for (let i = 0; i < 360; i += 360 / count) {
            bullets.push(new Bullet(
                BulletUtils.circularTravel(origin, radius, startAngle + i, speed, ccwise, mode),
                bullet
            ));
        }
        return bullets;
    }
}