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
			//
			this.amountOpponents = Math.floor(Game.cH / this.opponent_h);
			//
			this.halfResidue = ((Game.cH / this.amountOpponents) - this.opponent_h) / 2;
			//
			this.coordinate = 0;
			//
			this.avoidFrames = 5;
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
			this.randomColor = Game.random(this.colorOpponents.length);
			//
			this.id = 'opponent_' + this.count;
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
				bullets: {},
				countBullet: 0,
				colorBullet: this.colorBullets[this.randomColor],
				shot: false,
				avoidFrames: 5
			};
		},

		loadOpponents: function () {
			for (let i in this.opponents) {
				//
				if (this.opponents[i].destination_y == Player.player.player_1.destination_y) {
					//
					if (this.opponents[i].avoidFrames === this.avoidFrames) {
						Bullet.addBulletOpponent(i);
						this.opponents[i].shot = true;
						//
						this.opponents[i].avoidFrames = 0;
					} else {
						this.opponents[i].avoidFrames++;
					}
				}
				//
				if (!this.opponents[i].shot) {
					// Rysowanie pojazdu przeciwnika bez strzału i wyzerowanie licznika klatek
					this.draw(this.opponents[i], this.opponents[i].frames);
					this.opponents[i].current_f = 0;
				} else if (this.opponents[i].shot) {
					// Rysowanie pojazdu przeciwnika po strzale
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
			this.countBulletsPlayer = 0;
			//
			this.moveBulletPlayer = 10;
			this.moveBulletOpponent = -10;
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

		addBulletOpponent: function (o) {
			Opponent.opponents[o].countBullet++;
			//
			this.id = `bullet_${Opponent.opponents[o].countBullet}`;
			Opponent.opponents[o].bullets[this.id] = {
				//
				source_x: Opponent.opponents[o].colorBullet,
				source_y: 460,
				source_w: 10,
				source_h: 6,
				//
				destination_x: Opponent.opponents[o].destination_x + 20,
				destination_y: Opponent.opponents[o].destination_y + 83,
				destination_w: 10,
				destination_h: 6
			}
		},

		loadBullet: function () {
			//
			for (let i in this.bulletsPlayer) {
				this.draw(this.bulletsPlayer[i], this.moveBulletPlayer);
				this.deleteBulletPlayer(i);
			}
			//
			for (let i in Opponent.opponents) {
				//
				for (let j in Opponent.opponents[i].bullets) {
					this.draw(Opponent.opponents[i].bullets[j], this.moveBulletOpponent);
					this.deleteBulletOpponent(i, j)
				}
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

		deleteBulletOpponent: function (o, ob) {
			if (Opponent.opponents[o].bullets[ob].destination_x <= 0) {
				delete Opponent.opponents[o].bullets[ob];
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
