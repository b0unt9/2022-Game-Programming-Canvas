document.addEventListener('DOMContentLoaded', () => {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function rand(min, max, interval) {
        if (interval === undefined) interval = 1;
        return Math.round((Math.floor(Math.random() * (max - min + 1)) + min) / interval) * interval;
    }

    function randIndex(thearray) {
        return thearray[rand(1, thearray.length) - 1];
    }

    const player = (function () {
        let x = 100,
            y = canvas.height / 2,
            w = 10,
            h = 10,
            dead = false,
            death = 0

        return {
            getX: function () {
                return x;
            },

            getY: function () {
                return y;
            },

            getW: function () {
                return w;
            },

            getH: function () {
                return h;
            },

            die: function () {
                let sound = new Audio('warning-sound.mp3');
                sound.play();
                dead = true;
                ++death;
            },

            getDeath: function () {
                return death;
            },

            resurrect: function () {
                this.moveTo(100, canvas.height / 2);
                dead = false;
                this.draw();
            },

            respawn: function () {
                this.moveTo(100, canvas.height / 2);
                this.draw();
                blocks.nextLevel();
            },

            isDead: function () {
                return dead;
            },

            draw: function () {
                ctx.fillStyle = "#5472d3";
                ctx.fillRect(x, y, w, h);
            },

            moveTo: function (a, b) {
                if (dead) return;
                x = a;
                y = b;
                if (y + h > canvas.height) {
                    y = canvas.height - h;
                }
            },
        }
    })();


    let blocks = (function () {
        let blocks = [],
            level = 0,
            level_factor = 1.20,
            start = {
                n: 10,
                x1: 210,
                x2: 700,
                h_min: 15,
                h_max: 100 + level * 1.03,
                speed_min: 0.5 + level * 1.03,
                speed_max: 5 + level * 1.05,
                direction: ['up', 'down']
            };


        function Block(direction) {
            this.w = 10;
            this.h = rand(start.h_min, start.h_max);
            this.x = rand(start.x1, start.x2, 10);
            this.y = 0;
            this.speed = rand(start.speed_min, start.speed_max);
            this.direction = direction;
            if (direction === "up") {
                this.y = canvas.height + rand(5, 350);
            } else {
                this.y -= rand(5, 350);
            }
        }

        return {
            getLevel: function () {
                return level;
            },

            nextLevel: function () {
                ++level;
                blocks = [];
                let n = Math.ceil(start.n + (level * level_factor));
                this.createXBlocks(n);
            },

            draw: function (b) {
                if (player.isDead()) ctx.fillStyle = "#d50000";
                else ctx.fillStyle = "#5472d3";
                ctx.fillRect(b.x, b.y, b.w, b.h);
            },

            drawZone: function () {
                ctx.fillStyle = "#111111";
                ctx.fillRect(start.x1, 0, start.x2 - start.x1 + 10, canvas.height);
            },

            createXBlocks: function (n) {
                for (let i = 0; i < n; ++i) {
                    blocks.push(new Block(randIndex(start.direction)));
                }
            },

            moveAll: function () {
                let px = player.getX(),
                    py = player.getY(),
                    pw = player.getW(),
                    ph = player.getH();

                if (player.isDead()) return;
                else if (px > start.x2) {
                    ctrl.x = 0;
                    ctrl.y = canvas.height / 2;
                    ctrl.velX = 0;
                    ctrl.velY = 0;
                    player.respawn();
                    return;
                }
                let len = blocks.length;
                for (let i = 0; i < len; ++i) {
                    if (blocks[i].direction === 'up') {
                        blocks[i].y -= blocks[i].speed;
                        if ((blocks[i].y + blocks[i].h) < 0) {
                            blocks[i].y = canvas.height + rand(10, 350);
                        }
                    } else {
                        blocks[i].y += blocks[i].speed;
                        if (blocks[i].y > canvas.height) {
                            blocks[i].y = 0;
                            blocks[i].y -= rand(10, 350);
                        }
                    }

                    if (((px > blocks[i].x) && (px < (blocks[i].x + blocks[i].w))) &&
                        ((py > blocks[i].y) && py < (blocks[i].y + blocks[i].h))) {
                        player.die();
                    } else if (((px + pw < (blocks[i].x + blocks[i].w)) && (px + pw > blocks[i].x)) &&
                        ((py + ph < (blocks[i].y + blocks[i].h)) && py + ph > blocks[i].y)) {
                        player.die();
                    }

                }
            },

            drawAll: function () {
                for (let i in blocks) {
                    this.draw(blocks[i]);
                }
            },

        }
    })();


    let ctrl = {
        x: 100,
        y: (canvas.height / 2),
        velY: 0,
        velX: 0,
        speed: 1400 - blocks.getLevel() * 1.1 ,
        friction: 0.68,
        keys: []
    }

    function updateCtrl() {
        if (ctrl.keys.Escape || (ctrl.keys[' '] && player.isDead())) {
            ctrl.x = 100;
            ctrl.y = canvas.height / 2;
            ctrl.velX = 0;
            ctrl.velY = 0;
            player.resurrect();
        }

        if (ctrl.keys.ArrowUp || ctrl.keys.i || ctrl.keys.w || ctrl.keys.Home) {
            if (ctrl.velY > -ctrl.speed) {
                ctrl.velY--;
            }
        }

        if (ctrl.keys.ArrowDown || ctrl.keys.k || ctrl.keys.s || ctrl.keys.End) {
            if (ctrl.velY < ctrl.speed) {
                ctrl.velY++;
            }
        }

        if (ctrl.keys.ArrowRight || ctrl.keys.l || ctrl.keys.d || ctrl.keys.PageDown) {
            if (ctrl.velX < ctrl.speed) {
                ctrl.velX++;
            }
        }

        if (ctrl.keys.ArrowLeft || ctrl.keys.j || ctrl.keys.a || ctrl.keys.Delete) {
            if (ctrl.velX > -ctrl.speed) {
                ctrl.velX--;
            }
        }

        ctrl.velY *= ctrl.friction;
        ctrl.y += ctrl.velY;

        ctrl.velX *= ctrl.friction;
        ctrl.x += ctrl.velX;

        if (ctrl.x >= canvas.width) {
            ctrl.x = canvas.width;
        } else if (ctrl.x <= 5) {
            ctrl.x = 5;
        }

        if (ctrl.y > canvas.height) {
            ctrl.y = canvas.height;
        } else if (ctrl.y <= 5) {
            ctrl.y = 5;
        }

        player.moveTo(ctrl.x, ctrl.y);

        setTimeout(updateCtrl, 10);
    }

    updateCtrl();

    document.body.addEventListener("keydown", function (e) {
        ctrl.keys[e.key] = true;
    });

    document.body.addEventListener("keyup", function (e) {
        ctrl.keys[e.key] = false;
    });

    blocks.nextLevel();

    function update() {
        blocks.moveAll();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        blocks.drawZone();
        blocks.drawAll();
        player.draw();
        ctx.font = "14px Verdana";

        if (player.isDead()) {
            ctx.fillStyle = "#d50000";
            ctx.fillText("게임 오버!", 10, 50);
            ctx.fillText("다시 시작: [SPACE]", 10, 70);
        } else {
            ctx.fillStyle = "#5472d3";
            ctx.fillText("장애물을 피해 반대편으로 건너가기", 10, 20);
            ctx.fillText("키보드의 방향키로 이동 가능", 10, 40);
            ctx.fillText("위치 초기화 : ESC", 10, 60);
            ctx.fillText("레벨 : " + blocks.getLevel(), 10, 120);
            ctx.fillText("죽은 회수 : " + player.getDeath(), 10, 100);
        }
    }

    setInterval(function () {
        update();
        draw();
    }, 1000 / 60);
});