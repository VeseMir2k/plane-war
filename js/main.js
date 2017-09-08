(function () {
    const Game = {
        init: function () {
            this.canvas = document.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            // Dodanie grafiki
            this.sprite = new Image();
            this.sprite.src = 'image/sprite.png';
            //
            this.fps = 60;
            this.lastTime = 0;
            this.opponentsTime = 0;
            //
            this.layout();
            //
            Board.VAR();
            Board.addBackground(0);
            Board.addGround(0);
            //
            Player.VAR();
            Player.addPlayer();
            //
            Opponent.VAR();
            Opponent.setCoordinates();
            //
            Bullet.VAR();
            //
            ControlPlayer.VAR();
            ControlPlayer.events();
            //
            Scoring.VAR();
            //
            Collision.VAR();
            //
            this.animationLoop();
        },

        animationLoop: function (time) {
            requestAnimationFrame(this.animationLoop.bind(this));
            if (time - this.lastTime >= 1000 / this.fps) {
                this.lastTime = time;
                //
                this.layout();
                Board.loadBoard();
                Player.loadPlayer();
                ControlPlayer.control();
                Opponent.loadOpponents();
                Bullet.loadBullet();
                Collision.loadCollision();
            }

            if (time - this.opponentsTime >= 3000) {
                this.opponentsTime = time;
                //
                Opponent.addOpponent();
            }
        },

        layout: function (e) {
            // Rozdzieczość okna aplikacji
            this.W = window.innerWidth;
            this.H = window.innerHeight;
            // Skala grafiki
            this.scale = 1;
            // Rozdzielczość canvasu
            this.cW = this.canvas.width = 1280;
            this.cH = this.canvas.height = 720;
        },

        random: function (length) {
            return Math.floor(Math.random() * length);
        }
    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Board = {
        VAR: function () {
            this.backgrounds = {};
            this.countBackground = 0;
            //
            this.grounds = {};
            this.countGround = 0
            //
            this.moveBgackground = 4;
            this.moveGrround = 8;
        },

        addBackground: function (dx) {
            this.countBackground++;
            //
            this.id = `background_${this.countBackground}`;
            this.backgrounds[this.id] = {
                //
                source_x: 0,
                source_y: 460,
                source_w: 1280,
                source_h: 720,
                //
                destination_x: dx,
                destination_y: 0,
                destination_w: 1280,
                destination_h: 720,
                //
                checkPosition: true
            };
        },

        addGround: function (dx) {
            this.countGround++;
            //
            this.id = 'ground_' + this.countGround;
            this.grounds[this.id] = {
                //
                source_x: 0,
                source_y: 1180,
                source_w: 950,
                source_h: 83,
                //
                destination_x: dx,
                destination_y: 637,
                destination_w: 950,
                destination_h: 83,
                //
                checkPosition: true
            };
        },

        loadBoard: function () {
            for (let i in this.backgrounds) {
                // 
                this.draw(this.backgrounds[i], this.moveBgackground);
                // Sprawdzenie czy dodać następny background
                if (this.backgrounds[i].destination_x <= Game.cW && this.backgrounds[i].checkPosition) {
                    //
                    this.addBackground(this.backgrounds[i].destination_x + this.backgrounds[i].destination_w - 1);
                    //
                    this.backgrounds[i].checkPosition = false;
                }
                //
                this.deleteBackground(i);
            }
            //
            for (let i in this.grounds) {
                //
                this.draw(this.grounds[i], this.moveGrround);
                // Sprawdzenie czy dodać następny ground
                if (this.grounds[i].destination_x <= Game.cW && this.grounds[i].checkPosition) {
                    //
                    this.addGround(this.grounds[i].destination_x + this.grounds[i].destination_w);
                    //
                    this.grounds[i].checkPosition = false;
                }
                //
                this.deleteGround(i);
            }
        },

        draw: function (Obj, move) {
            Game.ctx.drawImage(
                Game.sprite,
                Obj.source_x,
                Obj.source_y,
                Obj.source_w,
                Obj.source_h,
                Obj.destination_x -= move,
                Obj.destination_y,
                Obj.destination_w,
                Obj.destination_h
            );
        },

        deleteBackground: function (o) {
            if (this.backgrounds[o].destination_x <= -this.backgrounds[o].destination_w) {
                delete this.backgrounds[o];
            }
        },

        deleteGround: function (o) {
            if (this.grounds[o].destination_x <= -this.grounds[o].destination_w) {
                delete this.grounds[o];
            }
        }
    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Player = {
        VAR: function () {
            this.player = {};
            this.player_w = 169;
            this.player_h = 114;
            this.move = 15;
        },

        addPlayer: function () {
            this.id = 'player_1';
            this.player[this.id] = {
                //
                source_x: 0,
                source_y: 0,
                source_w: 169,
                source_h: 114,
                //
                destination_x: 20,
                destination_y: (Game.cH / 2) - (this.player_h / 2),
                destination_w: this.player_w,
                destination_h: this.player_h,
                //
                frames: [0, 1],
                framesShot: [2, 3, 4, 5, 6],
                current_f: 0,
                //
                shot: false
            };
        },

        loadPlayer: function () {
            for (let i in this.player) {
                // Sprawdzanie czy shot = true/false
                if (!this.player[i].shot) {
                    // Rysowanie gracza bez strzału
                    this.draw(this.player[i], this.player[i].frames);
                } else if (this.player[i].shot) {
                    // Rysowanie gracza po strzale
                    this.draw(this.player[i], this.player[i].framesShot);
                    // Sprawdzenie czy zakończyć animacje strzału
                    if (this.player[i].current_f + 1 == this.player[i].framesShot.length) {
                        // Wyzerowanie licznika klatek i ustawienie shot = false
                        this.player[i].current_f = 0;
                        this.player[i].shot = false;
                    }
                }
            }
        },

        draw: function (Obj, frames) {
            Game.ctx.drawImage(
                Game.sprite,
                Obj.source_x + frames[Obj.current_f] * Obj.source_w,
                Obj.source_y,
                Obj.source_w,
                Obj.source_h,
                Obj.destination_x,
                Obj.destination_y,
                Obj.destination_w,
                Obj.destination_h
            );
            //
            Obj.current_f = Obj.current_f + 1 >= frames.length ? 0 : Obj.current_f + 1;
        }
    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Opponent = {
        VAR: function () {
            this.opponents = {};
            this.opponent_w = 169;
            this.opponent_h = 114;
            this.count = 0;
            this.move = 5;
            this.colorOpponents = [115, 230, 345];
            this.colorBullets = [1290, 1300, 1310];
            this.coordinates = [];
            // Ilość przeciwnikó w jednej lini
            this.amountOpponents = Math.floor(Game.cH / this.opponent_h);
            //
            this.halfResidue = ((Game.cH / this.amountOpponents) - this.opponent_h) / 2;
            //
            this.coordinate = 0;
            // Klatki ominięte przy strzelaniu przeciwnika
            this.avoidFramesBullet = 7;
        },

        setCoordinates: function () {
            for (let i = 0; i < this.amountOpponents; i++) {
                this.coordinate += this.halfResidue;
                this.coordinates[i] = this.coordinate;
                this.coordinate += this.halfResidue + this.opponent_h;
            }
        },

        addOpponent: function () {
            this.count++;
            //
            this.randomColor = Game.random(this.colorOpponents.length);
            //
            this.id = `opponent_${this.count}`;
            this.opponents[this.id] = {
                //
                source_x: 0,
                source_y: this.colorOpponents[this.randomColor],
                source_w: 169,
                source_h: 114,
                //
                destination_x: Game.cW,
                destination_y: this.coordinates[Game.random(this.coordinates.length)],
                destination_w: this.opponent_w,
                destination_h: this.opponent_h,
                //
                frames: [0, 1],
                framesShot: [2, 3, 4, 5, 6],
                current_f: 0,
                //
                colorBullet: this.colorBullets[this.randomColor],
                shot: false,
                avoidFrames: 7
            };
        },

        loadOpponents: function () {
            for (let i in this.opponents) {
                // Sprawdzenie czy działko przeciwnika jest równe z graczem
                if ((this.opponents[i].destination_y + 85 >= Player.player.player_1.destination_y) &&
                    (this.opponents[i].destination_y + 85 <= Player.player.player_1.destination_y + Player.player.player_1.destination_h)) {
                    // Opuszczanie klatek w celu zrobienia odstępów między pociskami
                    if (this.opponents[i].avoidFrames === this.avoidFramesBullet) {
                        // 
                        Bullet.addBulletOpponent(i);
                        //
                        this.opponents[i].shot = true;
                        // Wyzerowanie licznika opuszczenia klatek
                        this.opponents[i].avoidFrames = 0;
                    } else {
                        // Zwiększenie licznika opuszczenia klatek
                        this.opponents[i].avoidFrames++;
                    }
                }
                //
                if (!this.opponents[i].shot) {
                    // Wywołanie rysowania pojazdu przeciwnika bez strzału
                    this.draw(this.opponents[i], this.opponents[i].frames);
                } else if (this.opponents[i].shot) {
                    // Wywołanie rysowania pojazdu przeciwnika po strzale
                    this.draw(this.opponents[i], this.opponents[i].framesShot);
                    // Sprawdzenie czy zakończyć animacje strzału
                    if (this.opponents[i].current_f + 1 == this.opponents[i].framesShot.length) {
                        // Wyzerowanie licznika klatek i ustawienie shot = false
                        this.opponents[i].current_f = 0;
                        this.opponents[i].shot = false;
                    }
                }
                //
                this.deleteOpponent(i);
            }
        },

        draw: function (Obj, frames) {
            Game.ctx.drawImage(
                Game.sprite,
                Obj.source_x + frames[Obj.current_f] * Obj.source_w,
                Obj.source_y,
                Obj.source_w,
                Obj.source_h,
                Obj.destination_x -= this.move,
                Obj.destination_y,
                Obj.destination_w,
                Obj.destination_h
            );
            //
            Obj.current_f = Obj.current_f + 1 >= frames.length ? 0 : Obj.current_f + 1;
        },

        deleteOpponent: function (o) {
            if (this.opponents[o].destination_x <= -this.opponents[o].destination_w) {
                delete this.opponents[o];
            }
        }
    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Bullet = {
        VAR: function () {
            this.bulletsPlayer = {};
            this.bulletsOpponents = {};
            //
            this.countBulletPlayer = 0;
            this.countBulletOpponents = 0;
            //
            this.moveBulletPlayer = 10;
            this.moveBulletOpponent = -10;
        },

        addBulletPlayer: function () {
            this.countBulletPlayer++;
            //
            this.id = `bullet_${this.countBulletPlayer}`;
            this.bulletsPlayer[this.id] = {
                //
                source_x: 1280,
                source_y: 460,
                source_w: 10,
                source_h: 6,
                //
                destination_x: 144,
                destination_y: Player.player.player_1.destination_y + 83,
                destination_w: 10,
                destination_h: 6,
            };
        },

        addBulletOpponent: function (o) {
            this.countBulletOpponents++;
            //
            this.id = `bullet_${this.countBulletOpponents}`;
            this.bulletsOpponents[this.id] = {
                //
                source_x: Opponent.opponents[o].colorBullet,
                source_y: 460,
                source_w: 10,
                source_h: 6,
                //
                destination_x: Opponent.opponents[o].destination_x + 35,
                destination_y: Opponent.opponents[o].destination_y + 83,
                destination_w: 10,
                destination_h: 6
            }
        },

        loadBullet: function () {
            for (let i in this.bulletsPlayer) {
                this.draw(this.bulletsPlayer[i], this.moveBulletPlayer);
                //
                this.deleteBulletPlayer(i);
            }
            //
            for (let i in this.bulletsOpponents) {
                this.draw(this.bulletsOpponents[i], this.moveBulletOpponent);
                //
                this.deleteBulletOpponent(i);
            }
        },

        draw: function (Obj, move) {
            Game.ctx.drawImage(
                Game.sprite,
                Obj.source_x,
                Obj.source_y,
                Obj.source_w,
                Obj.source_h,
                Obj.destination_x += move,
                Obj.destination_y,
                Obj.destination_w,
                Obj.destination_h
            );
        },

        deleteBulletPlayer: function (o) {
            if (this.bulletsPlayer[o].destination_x >= Game.cW) {
                delete this.bulletsPlayer[o];
            }
        },

        deleteBulletOpponent: function (o, ) {
            if (this.bulletsOpponents[o].destination_x <= 0) {
                delete this.bulletsOpponents[o];
            }
        }
    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Collision = {
        VAR: function () {
            this.player = Player.player.player_1;
            this.opponent = Opponent.opponents;
            this.bulletsOpponent = Bullet.bulletsOpponents;
            this.bulletsPlayer = Bullet.bulletsPlayer;
            //
            this.explosion = {}
            this.countExplosion = 0;
            //
            this.avoidFramesExplosion = 1;
        },

        playerVAR: function () {
            this.pdx = Player.player.player_1.destination_x;
            this.pdw = Player.player.player_1.destination_w;
            this.pdy = Player.player.player_1.destination_y;
            this.pdh = Player.player.player_1.destination_h;
        },

        opponentsVAR: function (o) {
            this.odx = Opponent.opponents[o].destination_x;
            this.odw = Opponent.opponents[o].destination_w;
            this.ody = Opponent.opponents[o].destination_y;
            this.odh = Opponent.opponents[o].destination_h;
        },

        bulletsPlayerVAR: function (o) {
            this.bpdx = Bullet.bulletsPlayer[o].destination_x;
            this.bpdw = Bullet.bulletsPlayer[o].destination_w;
            this.bpdy = Bullet.bulletsPlayer[o].destination_y;
            this.bpdh = Bullet.bulletsPlayer[o].destination_h;
        },

        bulletsOpponentVAR: function (o) {
            this.bodx = Bullet.bulletsOpponents[o].destination_x;
            this.bodw = Bullet.bulletsOpponents[o].destination_w;
            this.body = Bullet.bulletsOpponents[o].destination_y;
            this.bodh = Bullet.bulletsOpponents[o].destination_h;
        },

        explosionVAR: function (o) {
            this.ef = this.explosion[o].frames;
            this.ecf = this.explosion[o].current_f;
        },

        loadCollision: function () {
            this.collisionPlayerWithOpponent();
            this.collisionPlayerWithBulletsOpponent();
            this.collisionBulletsPlayerWithOpponent();
            this.collisionPlayerWithBoard();
            this.collisionBulletsPlayerWithBulletsOpponent();
            //
            this.loadExplosion();
        },

        collisionPlayerWithOpponent: function () {
            for (let i in this.opponent) {
                //
                this.playerVAR();
                //
                this.opponentsVAR(i);
                //
                if ((this.odx <= this.pdx + (this.pdw - 30)) &&
                    ((this.ody >= this.pdy && this.ody <= this.pdy + this.pdh) || (this.ody + this.odh >= this.pdy && this.ody + this.odh <= this.pdy + this.pdh))) {
                    //
                    this.addExplosion(this.odx - 50, this.ody - 30, 192, 192);
                    //
                    delete this.opponent[i];
                }
            }
        },

        collisionPlayerWithBulletsOpponent: function () {
            for (let i in this.bulletsOpponent) {
                //
                this.playerVAR();
                //
                this.bulletsOpponentVAR(i);
                //
                if ((this.bodx <= this.pdx + (this.pdw - 60)) &&
                    ((this.body >= this.pdy && this.body <= this.pdy + this.pdh - 10) || (this.body + this.bodh >= this.pdy && this.body + this.bodh <= this.pdy + this.pdh - 10))) {
                    //
                    this.addExplosion(this.bodx - 20, this.body - 20, 40, 40);
                    //
                    delete this.bulletsOpponent[i];
                }
            }
        },

        collisionBulletsPlayerWithOpponent: function () {
            for (let i in this.opponent) {
                //
                this.opponentsVAR(i);
                //
                for (let j in Bullet.bulletsPlayer) {
                    //
                    this.bulletsPlayerVAR(j);
                    //
                    if ((this.bpdx >= this.odx + (this.odw - 60)) &&
                        ((this.bpdy >= this.ody && this.bpdy <= this.ody + this.odh - 10) || (this.bpdy + this.bpdh >= this.ody && this.bpdy + this.bpdh <= this.ody + this.odh - 10))) {
                        //
                        this.addExplosion(this.odx - 50, this.ody - 30, 192, 192);
                        //
                        delete this.opponent[i];
                        delete this.bulletsPlayer[j];
                        Scoring.scorePlayer += 50;
                        console.log(Scoring.scorePlayer);
                        break;
                    }
                }
            }
        },

        collisionPlayerWithBoard: function () {
            if (this.player.destination_y <= 0) {
                this.player.destination_y = 0;
            } else if (this.player.destination_y >= Game.cH - this.player.destination_h) {
                this.player.destination_y = Game.cH - this.player.destination_h;
            }
        },

        collisionBulletsPlayerWithBulletsOpponent: function () {
            for (let i in this.bulletsPlayer) {
                //
                this.bulletsPlayerVAR(i);
                //
                for (let j in this.bulletsOpponent) {
                    //
                    this.bulletsOpponentVAR(j);
                    //
                    if ((this.bpdx >= this.bodx) &&
                        ((this.bpdy >= this.body && this.bpdy <= this.body + this.bodh) || (this.bpdy + this.bpdh >= this.body && this.bpdy + this.bpdh <= this.body + this.bodh))) {
                        //
                        this.addExplosion(this.bpdx - 20, this.bpdy - 20, 40, 40)
                        //
                        delete this.bulletsPlayer[i];
                        delete this.bulletsOpponent[j];
                        Scoring.scorePlayer += 10;
                        console.log(Scoring.scorePlayer);
                        break;
                    }
                }
            }
        },

        addExplosion: function (dx, dy, dw, dh) {
            this.countExplosion++;
            //
            this.id = `explosion_${this.countExplosion}`;
            this.explosion[this.id] = {
                //
                source_x: 0,
                source_y: 1595,
                source_w: 192,
                source_h: 192,
                //
                destination_x: dx,
                destination_y: dy,
                destination_w: dw,
                destination_h: dh,
                //
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                current_f: 0,
                //
                avoidFrames: 1
            }
        },

        loadExplosion: function () {
            for (let i in this.explosion) {
                //
                this.explosionVAR(i);
                //
                this.draw(this.explosion[i], this.ef);
                //
                if (this.ecf === this.ef.length - 1) {
                    delete this.explosion[i];
                }
            }
        },

        draw: function (Obj, frames) {
            Game.ctx.drawImage(
                Game.sprite,
                Obj.source_x + frames[Obj.current_f] * Obj.source_w,
                Obj.source_y,
                Obj.source_w,
                Obj.source_h,
                Obj.destination_x,
                Obj.destination_y,
                Obj.destination_w,
                Obj.destination_h
            );
            //
            if (Obj.avoidFrames === this.avoidFramesExplosion) {
                Obj.current_f = Obj.current_f + 1 >= frames.length ? 0 : Obj.current_f + 1;
                //
                Obj.avoidFrames = 0
            } else {
                Obj.avoidFrames++;
            }
        },

    };

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const Scoring = {
        VAR: function () {
            this.scorePlayer = 0;
        },
    }

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    const ControlPlayer = {
        VAR: function () {
            this.keys = [];
        },

        events: function () {
            document.addEventListener('keyup', this.keyup, false);
            document.addEventListener('keydown', this.keydown, false);
            document.addEventListener('keyup', this.shot, false);
        },

        control: function () {
            if (this.keys[38]) {
                Player.player.player_1.destination_y -= Player.move;
            } else if (this.keys[40]) {
                Player.player.player_1.destination_y += Player.move;
            }
        },

        shot: function (e) {
            if (e.keyCode === 32) {
                Bullet.addBulletPlayer();
                Player.player.player_1.shot = true;
                Player.player.player_1.current_f = 0;
            }
        },

        keyup: function (e) {
            ControlPlayer.keys[e.keyCode] = false;
        },

        keydown: function (e) {
            ControlPlayer.keys[e.keyCode] = true;
        },
    };

    Game.init();

})();
