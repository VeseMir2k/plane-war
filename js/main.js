(function () {
    const Game = {
        init: function () {
            this.canvas = document.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            // Dodanie grafik
            this.sprite = new Image();
            this.sprite.src = 'image/sprite.png';
            // Zmienne do odświeżania obrazu
            this.fps = 60;
            this.lastTime = 0;
            this.opponentsTime = 0;
            // Ustawienie rozdzielczości
            this.layout();
            //	Dodanie grafiki w tle
            Board.VAR();
            Board.addBackground(0);
            Board.addGround(0);
            // Dodanie gracza
            Player.VAR();
            Player.addPlayer();
            //	Dodanie przeciwników
            Opponent.VAR();
            Opponent.setCoordinates();
            // Dodanie pocisków
            Bullet.VAR();
            // Sterowanie pojazdem gracza
            ControlPlayer.VAR();
            ControlPlayer.events();
            //
            Collision.VAR();
            // Wywołanie odświeżania gry 
            this.animationLoop();
        },

        animationLoop: function (time) {
            requestAnimationFrame(this.animationLoop.bind(this));
            if (time - this.lastTime >= 1000 / this.fps) {
                this.lastTime = time;
                // Wywołanie ustawień rozdzielczości
                this.layout();
                // Wywołanie ładowania grafiki w tle
                Board.loadBoard();
                // Wywołanie ładowania pojazdu gracza
                Player.loadPlayer();
                // Wywolanie sterowania pojazdem gracza
                ControlPlayer.control();
                // Wywołanie ładowania pojazdow przeciwników
                Opponent.loadOpponents();
                // Wywołanie ładowania pocisków gracza i przeciwnika
                Bullet.loadBullet();
                //
                Collision.loadCollision();
            }

            if (time - this.opponentsTime >= 3000) {
                this.opponentsTime = time;
                // Wywołanie dodawania przeciwnika
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
            // Obiekt background i licznik background
            this.backgrounds = {};
            this.countBackground = 0;
            // Obiekt ground i licznik ground
            this.grounds = {};
            this.countGround = 0
            // Prędkości poruszania się obiektów
            this.moveBgackground = 4;
            this.moveGrround = 8;
        },

        addBackground: function (dx) {
            this.countBackground++;
            //
            this.id = `background_${this.countBackground}`;
            this.backgrounds[this.id] = {
                // Punkt i rozmiar wycinania grafiki
                source_x: 0,
                source_y: 460,
                source_w: 1280,
                source_h: 720,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: dx,
                destination_y: 0,
                destination_w: 1280,
                destination_h: 720,
                // Sprawdzenie pozycji background
                checkPosition: true
            };
        },

        addGround: function (dx) {
            this.countGround++;
            //
            this.id = 'ground_' + this.countGround;
            this.grounds[this.id] = {
                // Punkt i rozmiar wycinania grafiki
                source_x: 0,
                source_y: 1180,
                source_w: 950,
                source_h: 83,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: dx,
                destination_y: 637,
                destination_w: 950,
                destination_h: 83,
                // Sprawdzenie pozycji background
                checkPosition: true
            };
        },

        loadBoard: function () {
            for (let i in this.backgrounds) {
                // Wywołanie rysowania background
                this.draw(this.backgrounds[i], this.moveBgackground);
                // Sprawdzenie czy dodać następny background
                if (this.backgrounds[i].destination_x <= Game.cW && this.backgrounds[i].checkPosition) {
                    // Dodanie background na koniec wcześniejszego background
                    this.addBackground(this.backgrounds[i].destination_x + this.backgrounds[i].destination_w - 1);
                    // Ustawienie checkPosition = false
                    this.backgrounds[i].checkPosition = false;
                }
                // Wywołanie usunięcia background
                this.deleteBackground(i);
            }
            //
            for (let i in this.grounds) {
                // Wywołanie rysowania ground
                this.draw(this.grounds[i], this.moveGrround);
                // Sprawdzenie czy dodać następny ground
                if (this.grounds[i].destination_x <= Game.cW && this.grounds[i].checkPosition) {
                    // Dodanie ground na koniec wcześniejszego background
                    this.addGround(this.grounds[i].destination_x + this.grounds[i].destination_w);
                    // Ustawienie checkPosition = false
                    this.grounds[i].checkPosition = false;
                }
                // Wywołanie usunięcia ground
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
                // Punkt i rozmiar wycinania grafiki
                source_x: 0,
                source_y: 0,
                source_w: 169,
                source_h: 114,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: 20,
                destination_y: (Game.cH / 2) - (this.player_h / 2),
                destination_w: this.player_w,
                destination_h: this.player_h,
                // Klatki animacji pojazdu
                frames: [0, 1],
                framesShot: [2, 3, 4, 5, 6],
                current_f: 0,
                // Pociski
                bullets: {},
                countBullet: 0,
                shot: false
            };
        },

        loadPlayer: function () {
            for (let i in this.player) {
                // Sprawdzanie czy shot = true/false
                if (!this.player[i].shot) {
                    // Rysowanie pojazdu gracza bez strzału
                    this.draw(this.player[i], this.player[i].frames);
                } else if (this.player[i].shot) {
                    // Rysowanie pojazdu gracza po strzale
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
            // Przewijanie do następnej pozycji pojazdu
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
            // Klatki ominięte przys trzelaniu przeciwnika
            this.avoidFrames = 7;
        },

        setCoordinates: function () {
            // Ustawienie coordinatespojawiania sie przeciwników
            for (let i = 0; i < this.amountOpponents; i++) {
                this.coordinate += this.halfResidue;
                this.coordinates[i] = this.coordinate;
                this.coordinate += this.halfResidue + this.opponent_h;
            }
        },

        addOpponent: function () {
            this.count++;
            // Losowanie koloru pojazdu przeciwnikó
            this.randomColor = Game.random(this.colorOpponents.length);
            //
            this.id = `opponent_${this.count}`;
            this.opponents[this.id] = {
                // Punkt i rozmiar wycinania grafiki
                source_x: 0,
                source_y: this.colorOpponents[this.randomColor],
                source_w: 169,
                source_h: 114,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: Game.cW,
                destination_y: this.coordinates[Game.random(this.coordinates.length)],
                destination_w: this.opponent_w,
                destination_h: this.opponent_h,
                // Klatki animacji pojazdu
                frames: [0, 1],
                framesShot: [2, 3, 4, 5, 6],
                current_f: 0,
                // Pociski
                colorBullet: this.colorBullets[this.randomColor],
                shot: false,
                avoidFrames: 5
            };
        },

        loadOpponents: function () {
            for (let i in this.opponents) {
                // Sprawdzenie czy działko przeciwnika jest równe z pojazdem gracza
                if (this.opponents[i].destination_y + 85 >= Player.player.player_1.destination_y &&
                    this.opponents[i].destination_y + 85 <= Player.player.player_1.destination_y + Player.player.player_1.destination_h) {
                    // Opuszczanie klatek w celu zrobienia odstępów między pociskami
                    if (this.opponents[i].avoidFrames === this.avoidFrames) {
                        // Wywołanie dodania pocisków przeciwnika
                        Bullet.addBulletOpponent(i);
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
                    // Wywołanie rysowania pojazdu przeciwnika bez strzału i wyzerowanie licznika klatek
                    this.draw(this.opponents[i], this.opponents[i].frames);
                    this.opponents[i].current_f = 0;
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
            // Przewijanie do następnej pozycji pojazdu
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
                // Punkt i rozmiar wycinania grafiki
                source_x: 1280,
                source_y: 460,
                source_w: 10,
                source_h: 6,
                // Punkt i rozmiar wstawienia wyciętej grafiki
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
                // Punkt i rozmiar wycinania grafiki
                source_x: Opponent.opponents[o].colorBullet,
                source_y: 460,
                source_w: 10,
                source_h: 6,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: Opponent.opponents[o].destination_x + 35,
                destination_y: Opponent.opponents[o].destination_y + 83,
                destination_w: 10,
                destination_h: 6
            }
        },

        loadBullet: function () {
            for (let i in this.bulletsPlayer) {
                this.draw(this.bulletsPlayer[i], this.moveBulletPlayer);
                this.deleteBulletPlayer(i);
            }
            //
            for (let i in this.bulletsOpponents) {
                this.draw(this.bulletsOpponents[i], this.moveBulletOpponent);
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
            this.pl = Player.player.player_1;
            this.ops = Opponent.opponents;
            this.bops = Bullet.bulletsOpponents;
            this.bpl = Bullet.bulletsPlayer;
            //
            this.explosion = {}
            this.countExplosion = 0;
            //
            this.avoidFrames = 1;
        },

        loadCollision: function () {
            this.collisionPlayerWithOpponent();
            this.collisionPlayerWithBulletsOpponent();
            this.collisionBulletsPlayerWithOpponent();
            this.collisionPlayerWithBoard();
            //
            this.loadExplosion();
        },

        collisionPlayerWithOpponent: function () {
            for (let i in Opponent.opponents) {
                if (this.ops[i].destination_x <= this.pl.destination_x + (this.pl.destination_w - 30) &&
                    (this.ops[i].destination_y >= this.pl.destination_y && this.ops[i].destination_y <= this.pl.destination_y + this.pl.destination_h ||
                        this.ops[i].destination_y + this.ops[i].destination_h >= this.pl.destination_y && this.ops[i].destination_y + this.ops[i].destination_h <= this.pl.destination_y + this.pl.destination_h)) {
                    //
                    this.addExplosion(this.ops[i].destination_x, this.ops[i].destination_y);
                    //
                    delete this.ops[i];
                }
            }
        },

        collisionPlayerWithBulletsOpponent: function () {
            for (let i in Bullet.bulletsOpponents) {
                if (this.bops[i].destination_x <= this.pl.destination_x + (this.pl.destination_w - 60) &&
                    (this.bops[i].destination_y >= this.pl.destination_y && this.bops[i].destination_y <= this.pl.destination_y + this.pl.destination_h - 10 ||
                        this.bops[i].destination_y + this.bops[i].destination_h >= this.pl.destination_y && this.bops[i].destination_y + this.bops[i].destination_h <= this.pl.destination_y + this.pl.destination_h - 10)) {
                    delete this.bops[i];
                }
            }
        },

        collisionBulletsPlayerWithOpponent: function () {
            for (let i in Opponent.opponents) {
                for (let j in Bullet.bulletsPlayer) {
                    if (this.bpl[j].destination_x >= this.ops[i].destination_x + (this.ops[i].destination_h - 60) &&
                        (this.bpl[j].destination_y >= this.ops[i].destination_y && this.bpl[j].destination_y <= this.ops[i].destination_y + this.ops[i].destination_h - 10 ||
                            this.bpl[j].destination_y + this.bpl.destination_h >= this.ops[i].destination_y && this.bpl[j].destination_y + this.bpl[j].destination_h <= this.ops[i].destination_y + this.ops[i].destination_h - 10)) {
                        //
                        this.addExplosion(this.ops[i].destination_x, this.ops[i].destination_y);
                        //
                        delete this.ops[i];
                        delete this.bpl[j];
                        break;
                    }
                }
            }
        },

        collisionPlayerWithBoard: function () {
            if (this.pl.destination_y <= 0) {
                this.pl.destination_y = 0;
            } else if (this.pl.destination_y >= Game.cH - this.pl.destination_h) {
                this.pl.destination_y = Game.cH - this.pl.destination_h;
            }
        },

        collisionOpponentWithOpponent: function () {

        },

        addExplosion: function (dx, dy) {
            this.countExplosion++;
            //
            this.id = `explosion_${this.countExplosion}`;
            this.explosion[this.id] = {
                // Punkt i rozmiar wycinania grafiki
                source_x: 0,
                source_y: 1595,
                source_w: 192,
                source_h: 192,
                // Punkt i rozmiar wstawienia wyciętej grafiki
                destination_x: dx - 50,
                destination_y: dy - 30,
                destination_w: 192,
                destination_h: 192,
                //
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                current_f: 0,
                //
                avoidFrames: 1
            }
        },

        loadExplosion: function () {
            for (let i in this.explosion) {
                this.draw(this.explosion[i], this.explosion[i].frames);
                //
                if (this.explosion[i].current_f === this.explosion[i].frames.length - 1) {
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
            // Przewijanie do następnej pozycji pojazdu
            if (Obj.avoidFrames === this.avoidFrames) {
                Obj.current_f = Obj.current_f + 1 >= frames.length ? 0 : Obj.current_f + 1;

                Obj.avoidFrames = 0
            } else {
                Obj.avoidFrames++;
            }
        },

    };

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
