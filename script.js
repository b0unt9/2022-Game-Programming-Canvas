document.addEventListener('DOMContentLoaded', () => {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    function rand(min, max, interval) {
        if (interval === undefined) interval = 1;
        return Math.round((Math.floor(Math.random() * (max - min + 1)) + min) / interval) * interval;
    }

    var player = (function () {
        var x = 100,
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
                dead = true;
                death++;
            },

            getDeath: function() {
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
                blocks.run();
            },

            isDead: function () {
                return dead;
            },

            draw: function () {
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


    var blocks = (function () {
        var blocks = [],
            start = {
                n: 10,
                x1: 210,
                x2: 700,
                h_min: 15,
                h_max: 100,
                speed_min: 0.5,
                speed_max: 5
            };


        function Block() {
            this.w = 10;
            this.h = 50;
            this.x = rand(210, 700, 10);
            this.y = canvas.height;
            this.speed = 1;
        }

        return {
            run: function () {
                blocks = [];
                var n = Math.ceil(start.n + 1.3);
                this.createXBlocks(n);
            },

            draw: function (b) {
                if(player.isDead()) ctx.fillStyle = "#d50000";
                else ctx.fillStyle = "#5472d3";
                ctx.fillRect(b.x, b.y, b.w, b.h);
            },

            drawZone: function () {
                ctx.fillStyle = "#111111";
                ctx.fillRect(start.x1, 0, start.x2 - start.x1 + 10, canvas.height);
            },

            createXBlocks: function (n) {
                for (i = 0; i < n; ++i) {
                    blocks.push(new Block());
                }
            },

            moveAll: function () {
                var px = player.getX(),
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

                var len = blocks.length;
                for (i = 0; i < len; ++i) {
                    blocks[i].y += blocks[i].speed;
                    if (blocks[i].y > canvas.height) {
                        blocks[i].y = 0;
                        blocks[i].y -= rand(10, 350);
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
                for (var i in blocks) {
                    this.draw(blocks[i]);
                }
            },

        }
    })();


    var ctrl = {
        x: 100,
        y: (canvas.height / 2),
        velY: 0,
        velX: 0,
        speed: 1400,
        friction: 0.68,
        keys: []
    }

    function updateCtrl() {
        if (ctrl.keys.Escape) {
            ctrl.x = 100;
            ctrl.y = canvas.height / 2;
            ctrl.velX = 0;
            ctrl.velY = 0;
            player.resurrect();
        }

        if (ctrl.keys.ArrowUp || ctrl.keys.i || ctrl.keys.w) {
            if (ctrl.velY > -ctrl.speed) {
                ctrl.velY--;
            }
        }

        if (ctrl.keys.ArrowDown || ctrl.keys.k || ctrl.keys.s) {
            if (ctrl.velY < ctrl.speed) {
                ctrl.velY++;
            }
        }

        if (ctrl.keys.ArrowRight || ctrl.keys.l || ctrl.keys.d) {
            if (ctrl.velX < ctrl.speed) {
                ctrl.velX++;
            }
        }

        if (ctrl.keys.ArrowLeft || ctrl.keys.j || ctrl.keys.a) {
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

    blocks.run();

    function update() {
        blocks.moveAll();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        blocks.drawZone();
        blocks.drawAll();
        player.draw();
        ctx.fillStyle = "#ffffff";
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
            ctx.fillText("죽은 회수 : " + player.getDeath(),10,100);
        }
    }

    setInterval(function () {
        update();
        draw();
    }, 1000 / 60);
});