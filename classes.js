import { LEFT, RIGHT, UP, DOWN, CANVASW, CANVASH } from './const.js';

const invincibility = 2000;

export class Player {
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
    
    draw(ctx) {
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

    checkForWhite(ctx) {
        let found = false;
        for (let i = this.pos.x; i <= this.pos.x + this.size.x; i++) {
            for (let j = this.pos.y; j <= this.pos.y + this.size.y; j++) {
                const img = ctx.getImageData(i, j, 1, 1);
                const [r, g, b, a] = img.data;
                if (r+g+b+a === 1020) {
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        if (found) this.takeDamage();
    }
}