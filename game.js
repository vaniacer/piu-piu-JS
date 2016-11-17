/* Piu-piu game on Phaser engine */

document.body.style.cursor = 'none'; // Hide cursor

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {

	game.load.image('GO',          'images/GO.png');
	game.load.image('WD',          'images/WD.png');
	game.load.image('sky',         'images/sky.png');
	game.load.image('hero',        'images/hero.png');
	game.load.image('life',        'images/life.png');
	game.load.image('ammo',        'images/ammo.png');
	game.load.image('back',        'images/back.png');
	game.load.image('blood',       'images/blood.png');
	game.load.image('black',       'images/black.png');
	game.load.image('solid',       'images/solid.png');
    game.load.image('enemy',       'images/enemy.png');
	game.load.image('health',      'images/health.png');
    game.load.image('clouds',      'images/clouds.png');
	game.load.image('bullet',      'images/bullet.png');
	game.load.image('fireRate',    'images/firerate.png');  
	game.load.image('firePower',   'images/firepower.png');

	game.load.spritesheet('boss',  'images/boss.png',  80, 38);
    game.load.spritesheet('blast', 'images/blast.png', 60, 60);

}

// Start parameters
ammo        = 1000;
score       = 0;
goback      = false;
health      = 3;
tilboss     = 100;   // 100
fireRate    = 200;
nextFire    = 0;
bossFRate   = 0;
nextAlpha   = 0;
nextBlood   = 0;
firePower   = 7;
bonus_rnd   = 2;     // 3
alienSpeed  = 150;
alienHealth = 20;
bossHealth  = 10000; //10000

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // A simple background for our game
    game.add.sprite(0, 0, 'sky');

	// Add low clouds
	cloudsl = game.add.sprite(0, game.world.height - 85, 'clouds');
	game.physics.arcade.enable(cloudsl);
	cloudsl.enableBody = true;
	cloudsl.body.velocity.x = -25;

	// Add top clouds
	cloudst = game.add.sprite(0, 80, 'clouds');
	game.physics.arcade.enable(cloudst);
	cloudst.scale.setTo(1, -1);
	cloudst.enableBody = true;
	cloudst.body.velocity.x = -75;

	// Add moving earth
	earth = game.add.sprite(0, game.world.height - 40, 'back');
	game.physics.arcade.enable(earth);
	earth.enableBody = true;
	earth.body.velocity.x = -50;

	// Add solid earth
	earths = game.add.sprite(0, game.world.height + 5, 'solid');
	game.physics.arcade.enable(earths);
	earths.enableBody     = true;
	earths.body.immovable = true;

	// Add invisible border behind left border to get rid of the aliens
	border = game.add.sprite(-(game.world.width + 50), 0, 'sky');
	game.physics.arcade.enable(border);
	border.body.immovable = true;

    // The player and its settings
    hero = game.add.sprite(0, 0, 'hero');
    game.physics.arcade.enable(hero);
	hero.body.moves = false;

    // Create 10 aliens for a start
	aliens = game.add.group();
	aliens.enableBody = true;
	for (i = 0; i < 10; i++) {

		X = game.rnd.integerInRange(game.world.width, game.world.width + 100);
		Y = game.rnd.integerInRange(0, game.world.height - 40);

		alien = aliens.create(X, Y, 'enemy');
		alien.body.velocity.x = -alienSpeed; // set aliens speed
		alien.health          =  alienHealth;

	}

	// Create Boss
	boss = game.add.sprite(game.world.width + 10, 10, 'boss');
	game.physics.arcade.enable(boss);
	boss.enableBody = true;
	boss.health = bossHealth;
	boss.animations.add( 'rotation', [0, 1, 2, 3], 10, true);
	boss.animations.play('rotation');

	// Create Boss health bar
	healthbar = game.add.sprite(game.world.width + 10, 10, 'health');

    // Create bonuses
	bonuses = game.add.group();
	bonuses.enableBody = true;
	bonuses.physicsBodyType = Phaser.Physics.ARCADE;
	bonuses.createMultiple(20, '');
	bonuses.setAll('checkWorldBounds', true);
	bonuses.setAll('outOfBoundsKill',  true);

	// Create blasts
	blasts = game.add.group();
	blasts.createMultiple(10, 'blast');
	blasts.setAll('checkWorldBounds', true);
	blasts.setAll('outOfBoundsKill',  true);
	blasts.callAll('animations.add', 'animations', 'blast', [0, 1, 2, 3, 4], 20, false);

	// Create bullets
	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;

	bullets.createMultiple(50, 'bullet');
	bullets.setAll('checkWorldBounds', true);
	bullets.setAll('outOfBoundsKill',  true);

	// Create boss bullets
	bossBullets = game.add.group();
	bossBullets.enableBody = true;
	bossBullets.physicsBodyType = Phaser.Physics.ARCADE;

	bossBullets.createMultiple(50, 'bullet');
	bossBullets.setAll('checkWorldBounds', true);
	bossBullets.setAll('outOfBoundsKill',  true);

	// The score
	scoreText    = game.add.text(8, 8, 'SCORE: ' + score + ' HEALTH: ' + health + ' AMMO: ' + ammo, { fontSize: '16px', fill: '#fff' });

	// GameOver screen
    black = game.add.sprite(0, 0, 'black');
	black.width  = game.world.width;
	black.height = game.world.height;
	black.alpha  = 0;

	GO = game.add.sprite(0, 0, 'GO');
	GO.anchor.setTo(0.5, 0.5);
	GO.x = game.world.width  / 2;
	GO.y = game.world.height / 2;
	GO.alpha  = 0;
	GO.health = 0;

    // Blood stripes
	bl1  = game.add.sprite(GO.x - game.rnd.integerInRange(102, 112), GO.y, 'blood'); bl1.alpha  = 0; bl1.health  = game.rnd.realInRange(GO.y, GO.y + 20);   // |\  /|
	bl2  = game.add.sprite(GO.x - game.rnd.integerInRange(102, 112), GO.y, 'blood'); bl2.alpha  = 0; bl2.health  = game.rnd.realInRange(GO.y, GO.y + 20);  //  | \/ |
	bl3  = game.add.sprite(GO.x - game.rnd.integerInRange(102, 112), GO.y, 'blood'); bl3.alpha  = 0; bl3.health  = game.rnd.realInRange(GO.y, GO.y + 20); //   |    |
                                                                                                                                                         //    |

	bl4  = game.add.sprite(GO.x - game.rnd.integerInRange(62,   72), GO.y, 'blood'); bl4.alpha  = 0; bl4.health  = game.rnd.realInRange(GO.y, GO.y + 20);   // |\  /|
	bl5  = game.add.sprite(GO.x - game.rnd.integerInRange(62,   72), GO.y, 'blood'); bl5.alpha  = 0; bl5.health  = game.rnd.realInRange(GO.y, GO.y + 20);  //  | \/ |
	bl6  = game.add.sprite(GO.x - game.rnd.integerInRange(62,   72), GO.y, 'blood'); bl6.alpha  = 0; bl6.health  = game.rnd.realInRange(GO.y, GO.y + 20); //   |    |
                                                                                                                                                         //         |
	bl7  = game.add.sprite(GO.x - game.rnd.integerInRange(40,   50), GO.y, 'blood'); bl7.alpha  = 0; bl7.health  = game.rnd.realInRange(GO.y, GO.y + 20);   // +--
	bl8  = game.add.sprite(GO.x - game.rnd.integerInRange(40,   50), GO.y, 'blood'); bl8.alpha  = 0; bl8.health  = game.rnd.realInRange(GO.y, GO.y + 20);  //  |_
	bl9  = game.add.sprite(GO.x - game.rnd.integerInRange(40,   50), GO.y, 'blood'); bl9.alpha  = 0; bl9.health  = game.rnd.realInRange(GO.y, GO.y + 20); //   |__

	bl10 = game.add.sprite(GO.x + game.rnd.integerInRange(130, 140), GO.y, 'blood'); bl10.alpha = 0; bl10.health = game.rnd.realInRange(GO.y, GO.y + 20);   // +--
	bl11 = game.add.sprite(GO.x + game.rnd.integerInRange(130, 140), GO.y, 'blood'); bl11.alpha = 0; bl11.health = game.rnd.realInRange(GO.y, GO.y + 20);  //  |_
	bl12 = game.add.sprite(GO.x + game.rnd.integerInRange(130, 140), GO.y, 'blood'); bl12.alpha = 0; bl12.health = game.rnd.realInRange(GO.y, GO.y + 20); //   |__

	bl13 = game.add.sprite(GO.x + game.rnd.integerInRange(180, 190), GO.y, 'blood'); bl13.alpha = 0; bl13.health = game.rnd.realInRange(GO.y, GO.y + 20);   // +--,
	bl14 = game.add.sprite(GO.x + game.rnd.integerInRange(180, 190), GO.y, 'blood'); bl14.alpha = 0; bl14.health = game.rnd.realInRange(GO.y, GO.y + 20);  //  |  |
	bl15 = game.add.sprite(GO.x + game.rnd.integerInRange(180, 190), GO.y, 'blood'); bl15.alpha = 0; bl15.health = game.rnd.realInRange(GO.y, GO.y + 20); //   | \
                                                                                                                                                         //    |
	WD = game.add.sprite(0, 0, 'WD');
	WD.anchor.setTo(0.5, 0.5);
	WD.x = game.world.width  / 2;
	WD.y = game.world.height / 2;
	WD.alpha  = 0;
	WD.health = 1;

}

//-------------------------------------------------------------------------------------------------------------------------------------
function update() {

	if (boss.health > 0) {

		// Move hero
		hero.x = game.input.x;
		hero.y = game.input.y;

		game.physics.arcade.overlap(hero,    bonuses, getbonus,    null, this);    // Hero get bonus
		game.physics.arcade.overlap(hero,    aliens,  herocollide, null, this);   // Hero collide with aliens
		game.physics.arcade.overlap(border,  aliens,  aliengone,   null, this);  // Alien fly away
		game.physics.arcade.overlap(bullets, aliens,  killalien,   null, this); // Alien hit by bullet

		game.physics.arcade.collide(aliens, earths);

		if (game.input.activePointer.isDown) { fire(); }

		if (score >= tilboss) { // BOSS

			game.physics.arcade.overlap(hero, boss,        heroboss, null, this);   // Hero collide with boss
			game.physics.arcade.overlap(hero, bossBullets, heroHit,  null, this);  // Hero hit by boss' bullet
			game.physics.arcade.overlap(boss, bullets,     hitboss,  null, this); // Boss hit by bullet

			bossmove();
			bosshealth();

			if (Math.ceil(boss.y) == Math.ceil(hero.y) || Math.ceil(boss.y) == Math.ceil(hero.y) + 1 || Math.ceil(boss.y) == Math.ceil(hero.y) - 1) { bossFire(); }

		}

		if (health <=  0) { gameover(GO); }

	}   else              { gameover(WD); }

	background();
	scoreText.text = 'SCORE: ' + score + ' HEALTH: ' + health + ' AMMO: ' + ammo;

	//game.debug.spriteInfo(boss, 32, 32);
	//game.debug.spriteInfo(hero, 32, 122);

}
//-------------------------------------------------------------------------------------------------------------------------------------

function heroHit(hero, bullet) {

	health -= 1;
	bullet.kill();

}

function heroboss(hero, boss) {

	gameover(GO);

}

function gameover(obj) {

	if (game.time.now > nextAlpha && obj.alpha < 1) {

		nextAlpha   += 300;
		obj.alpha   += 0.1;
		black.alpha += 0.1;

	}

	if (game.time.now > nextBlood && obj.health == 0) {

		nextBlood  += 1000;
		bl1.alpha  += 0.1; if (bl1.y  < bl1.health)  { bl1.y  += 0.3 };
		bl2.alpha  += 0.1; if (bl2.y  < bl2.health)  { bl2.y  += 0.3 };
		bl3.alpha  += 0.1; if (bl3.y  < bl3.health)  { bl3.y  += 0.3 };

		bl4.alpha  += 0.1; if (bl4.y  < bl4.health)  { bl4.y  += 0.3 };
		bl5.alpha  += 0.1; if (bl5.y  < bl5.health)  { bl5.y  += 0.3 };
		bl6.alpha  += 0.1; if (bl6.y  < bl6.health)  { bl6.y  += 0.3 };

		bl7.alpha  += 0.1; if (bl7.y  < bl7.health)  { bl7.y  += 0.3 };
		bl8.alpha  += 0.1; if (bl8.y  < bl8.health)  { bl8.y  += 0.3 };
		bl9.alpha  += 0.1; if (bl9.y  < bl9.health)  { bl9.y  += 0.3 };

		bl10.alpha += 0.1; if (bl10.y < bl10.health) { bl10.y += 0.3 };
		bl11.alpha += 0.1; if (bl11.y < bl11.health) { bl11.y += 0.3 };
		bl12.alpha += 0.1; if (bl12.y < bl12.health) { bl12.y += 0.3 };

		bl13.alpha += 0.1; if (bl13.y < bl13.health) { bl13.y += 0.3 };
		bl14.alpha += 0.1; if (bl14.y < bl14.health) { bl14.y += 0.3 };
		bl15.alpha += 0.1; if (bl15.y < bl15.health) { bl15.y += 0.3 };

	}

	document.body.style.cursor = 'auto'; // Get cursor back

}

function hitboss(boss, bullet) { // Boss hit by bullet

	bullet.kill();
	boss.health -= firePower;

}

function bossmove() { // Boss movement

	Y = Math.abs(boss.y - hero.y)
	if ( Y > 50 ) { spd = 300; }
	if ( Y < 50 ) { spd = 100; }
	if ( Y < 20 ) { spd = 50;  }
	if ( Y < 10 ) { spd = 10;  }

	if (boss.y < hero.y) { boss.body.velocity.y =  spd; }
	if (boss.y > hero.y) { boss.body.velocity.y = -spd; }
	if (boss.x > game.world.width / 2   && !goback) { boss.body.velocity.x = -200; } else { goback = true;  }
	if (boss.x < game.world.width - 150 &&  goback) { boss.body.velocity.x =  200; } else { goback = false; }

}

function bosshealth() {

	healthbar.scale.setTo(boss.health / bossHealth, 1);
	healthbar.reset(boss.x, healthbar.y = boss.y + 50);

}

function getbonus(hero, bonus) {

	switch(bonus.health) {

		case 0: ammo      += 100; break;
		case 1: health    += 1;   break;
		case 2: fireRate  -= 10;  break;
		case 3: firePower += 10;  break;

	}

	bonus.kill();

}

function makebonus(alien) {

	type  = game.rnd.integerInRange(0, 3); //type = 3;
	bonus = bonuses.getFirstDead();
	bonus.reset(alien.x, alien.y);
	bonus.body.velocity.x = -75;
	switch(type) {

		case 0: bonus.loadTexture('ammo');      break;
		case 1: bonus.loadTexture('life');      break;
		case 2: bonus.loadTexture('fireRate');  break;
		case 3: bonus.loadTexture('firePower'); break;

	}

	bonus.health = type;

}

function makeblast(obj) {

	blast = blasts.getFirstDead();
	blast.reset(obj.x, obj.y);
	blast.animations.play('blast', 30, false, true);

}

function fire() {

	X = game.input.x + 40;
	Y = game.input.y + 15 - firePower / 25;

	if (game.time.now > nextFire && bullets.countDead() > 0 && ammo > 0) {

		nextFire = game.time.now + fireRate;
		bullet   = bullets.getFirstDead();
		bullet.reset(X, Y);
		bullet.body.velocity.x = 600;
		bullet.scale.setTo(1, 1 + firePower / 25);
		ammo -= 1;

	}

}

function bossFire() {

	X = boss.x - 50;
	Y = boss.y + 20;

	if (game.time.now > bossFRate && bossBullets.countDead() > 0) {

		bossFRate = game.time.now + 300;
		bullet    = bossBullets.getFirstDead();
		bullet.reset(X, Y);
		bullet.scale.y = 2;
		bullet.body.velocity.x = -300;

	}

}

function renewAlien(alien) {

	if (score <= tilboss) {

		X = game.rnd.integerInRange(game.world.width, game.world.width + 100);
		Y = game.rnd.integerInRange(0, game.world.height - 40);
		alien.reset(X, Y);

	} else {

		X = boss.x;
		Y = boss.y;
		Z = game.rnd.integerInRange(Y, game.world.height - 40);

		alien.reset(X, Y);
		game.physics.arcade.moveToXY(alien, X, Z, 100, 5000); 

	}

	alien.body.velocity.x = -alienSpeed; // set aliens speed
	alien.health          =  alienHealth;
	alien.body.gravity.y  =  0;

}

function killalien(bullet, alien) { // Alien hit by bullet

	if (alien.health > 0) {

		bullet.kill();
		alien.health -= firePower;
		if (alien.health <= 0) {
			get_bonus = game.rnd.integerInRange(0, bonus_rnd);
			if (get_bonus == 0) { makebonus(alien); }
			makeblast(alien);
			alien.body.velocity.x = -100;
			alien.body.gravity.y  =  150;
			alien.body.bounce.y   =  0.4 + Math.random() * 0.2;
			alienHealth += 1;
			alienSpeed  += 1;
			score       += 1;

		}

	}

}

function herocollide(hero, alien) { // Hero collide with aliens

	if (alien.health > 0) {

		makeblast(alien);
		alien.body.velocity.x = -100;
		alien.body.gravity.y  =  150;
		alien.body.bounce.y   =  0.4 + Math.random() * 0.2;
		alien.health = 0;
		health -= 1;
		score  += 1;

	}

}

function aliengone(border, alien) { // Alien fly away

	renewAlien(alien);

}

function background() {

	if (earth.x   <= -400) { earth.reset   (0, game.world.height - 40); earth.body.velocity.x   = -50; }
	if (cloudst.x <= -400) { cloudst.reset (0,                     80); cloudst.body.velocity.x = -75; }
	if (cloudsl.x <= -400) { cloudsl.reset (0, game.world.height - 85); cloudsl.body.velocity.x = -25; }

}
