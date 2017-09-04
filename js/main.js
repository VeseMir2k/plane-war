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
			// Animowanie gry
			this.animationLoop();
		},

		animationLoop: function (time) {
			requestAnimationFrame(this.animationLoop.bind(this));
			//
			if (time - this.lastTime >= 1000 / this.fps) {
				//
				this.lastTime = time;
				// Ustawienie rozdzielczości
				this.layout();
				// Ładowanie grafiki w tle
				Board.loadBoard();
				// Ładowanie pojazdu gracza
				Player.loadPlayer();
				// Sterowanie pojazdem gracza
				ControlPlayer.control();
				// Ładowanie pojazdow przeciwników
				Opponent.loadOpponents();
				// Ładowanie pocisków gracza i przeciwnika
				Bullet.loadBullet();
			}

			if (time - this.opponentsTime >= 3000) {
				//
				this.opponentsTime = time;
				// Dodawanie przeciwnika
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
			this.id = 'background_' + this.countBackground;
			this.backgrounds[this.id] = {
				//
				source_x: 0,
				source_y: 460,
				//
				source_w: 1280,
				source_h: 720,
				//
				destination_x: dx,
				destination_y: 0,
				//
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
				//
				source_w: 950,
				source_h: 83,
				//
				destination_x: dx,
				destination_y: 637,
				//
				destination_w: 950,
				destination_h: 83,
				//
				checkPosition: true
			};
		},

		loadBoard: function () {
			for (let i in this.backgrounds) {
				this.draw(this.backgrounds[i], this.moveBgackground);
				//
				if (this.backgrounds[i].destination_x <= Game.cW && this.backgrounds[i].checkPosition) {
					//
					this.addBackground(this.backgrounds[i].destination_x + this.backgrounds[i].destination_w - 1);
					//
					this.backgrounds[i].checkPosition = false;
				}
				this.deleteBackground(i);
			}
			//
			for (let i in this.grounds) {
				this.draw(this.grounds[i], this.moveGrround);
				//
				if (this.grounds[i].destination_x <= Game.cW && this.grounds[i].checkPosition) {
					//
					this.addGround(this.grounds[i].destination_x + this.grounds[i].destination_w);
					//
					this.grounds[i].checkPosition = false;
				}
				this.deleteGround(i);
			}
		},

		draw: function (obj, move) {
			Game.ctx.drawImage(
				Game.sprite,
				obj.source_x,
				obj.source_y,
				obj.source_w,
				obj.source_h,
				obj.destination_x -= move,
				obj.destination_y,
				obj.destination_w,
				obj.destination_h
			);
		},

		deleteBackground: function (i) {
			if (this.backgrounds[i].destination_x <= -this.backgrounds[i].destination_w) {
				delete this.backgrounds[i];
			}
		},

		deleteGround: function (i) {
			if (this.grounds[i].destination_x <= -this.grounds[i].destination_w) {
				delete this.grounds[i];
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
				shot: false,
				current_f: 0
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

		draw: function (obj, frames) {
			Game.ctx.drawImage(
				Game.sprite,
				obj.source_x + frames[obj.current_f] * obj.source_w,
				obj.source_y,
				obj.source_w,
				obj.source_h,
				obj.destination_x,
				obj.destination_y,
				obj.destination_w,
				obj.destination_h
			);
			//
			obj.current_f = obj.current_f + 1 >= frames.length ? 0 : obj.current_f + 1;
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
			this.coordinates = [];
			//
			this.amountOpponents = Math.floor(Game.cH / this.opponent_h);
			//
			this.halfResidue = ((Game.cH / this.amountOpponents) - this.opponent_h) / 2;
			//
			this.coordinate = 0;
		},

		setCoordinates: function () {
			//
			for (let i = 0; i < this.amountOpponents; i++) {
				//
				this.coordinate += this.halfResidue;
				this.coordinates[i] = this.coordinate;
				this.coordinate += this.halfResidue + this.opponent_h;
			}
		},

		addOpponent: function () {
			this.count++;
			//
			this.id = 'opponent_' + this.count;
			this.opponents[this.id] = {
				//
				source_x: 0,
				source_y: this.colorOpponents[Game.random(this.colorOpponents.length)],
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
				shot: false,
				current_f: 0
			};
		},

		loadOpponents: function () {
			for (let i in this.opponents) {
				this.draw(this.opponents[i]);
				this.deleteOpponent(i);
			}
		},

		draw: function (obj) {
			Game.ctx.drawImage(
				Game.sprite,
				obj.source_x + obj.frames[obj.current_f] * obj.source_w,
				obj.source_y,
				obj.source_w,
				obj.source_h,
				obj.destination_x -= this.move,
				obj.destination_y,
				obj.destination_w,
				obj.destination_h
			);
			//
			obj.current_f = obj.current_f + 1 >= obj.frames.length ? 0 : obj.current_f + 1;
		},

		deleteOpponent: function (i) {
			if (this.opponents[i].destination_x <= -this.opponents[i].destination_w) {
				delete this.opponents[i];
			}
		}
	};

	/* ------------------------------------------------------------------------------------------------------------------------------------------------ */

	const Bullet = {
		VAR: function () {
			this.bulletsPlayer = {};
			this.countBulletsPlayer = 0;
			//
			this.moveBulletPlayer = 10;
		},

		addBulletPlayer: function () {
			this.countBulletsPlayer++;
			//
			this.id = 'bullet_' + this.countBulletsPlayer;
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

		loadBullet: function () {
			for (let i in this.bulletsPlayer) {
				this.draw(this.bulletsPlayer[i], this.moveBulletPlayer);
				//
				this.deleteBulletPlayer(i);
			}
		},

		draw: function (obj, move) {
			Game.ctx.drawImage(
				Game.sprite,
				obj.source_x,
				obj.source_y,
				obj.source_w,
				obj.source_h,
				obj.destination_x += move,
				obj.destination_y,
				obj.destination_w,
				obj.destination_h
			);
		},

		deleteBulletPlayer: function (i) {
			if (this.bulletsPlayer[i].destination_x >= Game.cW) {
				delete this.bulletsPlayer[i];
			}
		}
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
