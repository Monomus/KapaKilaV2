
EnemyTank = function (index, game, player, bullets) {

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;
    this.tank = game.add.sprite(x, y, 'enemytank');
    this.turret = game.add.sprite(x, y, 'enemytankgun');

    this.tank.anchor.set(0.5);
    this.tank.scale.setTo(0.5);
    this.turret.scale.setTo(0.5);
    this.turret.anchor.set(0.25, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = true;
    this.tank.body.collideWorldBounds = true;

    // this.tank.angle = game.rnd.angle();

    // game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function() {

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 500)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();
            bullet.scale.setTo(0.3);
            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500) - (90*Math.PI/180);
        }
    }

};



var game = new Phaser.Game(1600, 700, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload () {

    game.load.atlas('sprites', 'assets/sprites/tank.png', 'assets/sprites/tank.json');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.image('tank', 'assets/sprites/tank1_ice.png');
    game.load.image('tank2', 'assets/sprites/tank1_sand.png'),
    game.load.image('tank2gun', 'assets/sprites/tank1_sand_top.png');
    game.load.image('enemytank', 'assets/sprites/tank1_wood.png');
    game.load.image('tankgun', 'assets/sprites/tank1_ice_top.png');
    game.load.image('enemytankgun', 'assets/sprites/tank1_wood_top.png');
    game.load.image('shell', 'assets/sprites/shell.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
}

var land;

var tank;
var turret;
var tankLive;

var tank2;
var turret2;
var tank2Live;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;


var currentSpeed = 0;
var currentSpeed2 = 0;
var cursors;
var cursors2;

var bullets;
var bullets2;
var fireRate = 200;
var nextFire = 0;
var fireRate2 = 400;
var nextFire2 = 0;

var turningSpeed = 5;

function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(0, 0, 1600, 700);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 1600, 700, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = game.add.sprite(100, 350, 'tank');
    tank2 = game.add.sprite(1500, 350, 'tank2');

    //tank.angle -=180;
    tank.scale.setTo(0.5);
    tank.anchor.setTo(0.5, 0.5);
    tank.rotation -= (180*Math.PI/180);

    tank2.scale.setTo(0.5);
    tank2.anchor.setTo(0.5, 0.5);
    tank2.rotation -= (180*Math.PI/180);
    //tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;
    tank.body.bounce.setTo(1);
    tankLive = 5;
    // tank.x = 100;
    // tank.y = 350;

    game.physics.enable(tank2, Phaser.Physics.ARCADE);
    tank2.body.drag.set(0.2);
    tank2.body.maxVelocity.setTo(400, 400);
    tank2.body.collideWorldBounds = true;
    tank2.body.bounce.setTo(1);
    tank2Live = 5;
    // tank2.x = 1500;
    // tank2.y = 350;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(0, 0, 'tankgun');
    turret.scale.setTo(0.5);
    //turret.angle -=180;
    turret.anchor.setTo(0.25, 0.5);
    tank.angle +=180;

    turret2 = game.add.sprite(0, 0, 'tank2gun');
    turret2.scale.setTo(0.5);
    //turret.angle -=180;
    turret2.anchor.setTo(0.25, 0.5);
    turret2.angle += 180;
    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'shell');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('rotation', 90);
    // enemyBullets.setAll('scale', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    // for (var i = 0; i < enemiesTotal; i++)
    // {
    //     enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    //     i++;
    //     enemies.push(new EnemyTank(i, game, tank2, enemyBullets));
    // }
    
    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'shell');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    //bullets.rotation = 90*Math.PI/180;
    //bullets.setAll('scale', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    bullets2 = game.add.group();
    bullets2.enableBody = true;
    bullets2.physicsBodyType = Phaser.Physics.ARCADE;
    bullets2.createMultiple(30, 'shell');
    bullets2.setAll('anchor.x', 0.5);
    bullets2.setAll('anchor.y', 0.5);
    //bullets.rotation = 90*Math.PI/180;
    //bullets.setAll('scale', 0.5);
    bullets2.setAll('outOfBoundsKill', true);
    bullets2.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();

    tank2.bringToTop();
    turret2.bringToTop();

    // game.camera.follow(tank);
    // game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    // game.camera.focusOnXY(0, 0);

    cursors = {
        up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
        rotright: this.game.input.keyboard.addKey(Phaser.Keyboard.V),
        rotleft: this.game.input.keyboard.addKey(Phaser.Keyboard.C),
        fire: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      };
      
    cursors2 =  {
        up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
        down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
        left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
        right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
        rotright: this.game.input.keyboard.addKey(Phaser.Keyboard.P),
        rotleft: this.game.input.keyboard.addKey(Phaser.Keyboard.O),
        fire: this.game.input.keyboard.addKey(Phaser.Keyboard.L)
      };

}

function update () {

    game.physics.arcade.overlap(bullets2, tank, bulletHitPlayer, null, this);
    game.physics.arcade.overlap(bullets, tank2, bulletHitPlayer2, null, this);
    game.physics.arcade.overlap(tank, tank2, tankHitTank, null, this);
    game.physics.arcade.collide(tank,tank2);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            game.physics.arcade.collide(tank2, enemies[i].tank);
            game.physics.arcade.overlap(bullets2, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if (cursors.left.isDown)
    {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 4;
    }

    if (cursors.up.isDown)
    {
        currentSpeed = 300;
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
        }
    }

    if (cursors2.left.isDown)
    {
        tank2.angle -= 4;
    }
    else if (cursors2.right.isDown)
    {
        tank2.angle += 4;
    }

    if (cursors2.up.isDown)
    {
        currentSpeed2 = 300;
    }
    else
    {
        if (currentSpeed2 > 0)
        {
            currentSpeed2 -= 4;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    if (currentSpeed2 > 0)
    {
        game.physics.arcade.velocityFromRotation(tank2.rotation, currentSpeed2, tank2.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    turret.x = tank.x;
    turret.y = tank.y;

    turret2.x = tank2.x;
    turret2.y = tank2.y;

    if(cursors.rotright.isDown){
        turret.angle -= turningSpeed;
    }
    if(cursors.rotleft.isDown){
        turret.angle += turningSpeed;
    }

    if(cursors2.rotright.isDown){
        turret2.angle -= turningSpeed;
    }
    if(cursors2.rotleft.isDown){
        turret2.angle += turningSpeed;
    }

    // turret.rotation = game.physics.arcade.angleToPointer(turret);
    

    if (cursors.fire.isDown)
    {
        if(tankLive>0){
            fire();
        }
        
    }

    if (cursors2.fire.isDown)
    {
        if(tank2Live>0){
            fire2();
        }
    }


}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
    tankLive--;
    if(tankLive <=0){
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
        tank.kill();
        turret.kill();
    }

}

function bulletHitPlayer2(tank2, bullet){
    bullet.kill();
    tank2Live--;
    if(tank2Live <=0){
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank2.x, tank2.y);
        explosionAnimation.play('kaboom', 30, false, true);
        tank2.kill();
        turret2.kill();
    }
}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}


function fire () {
    console.log(tank.x,tank.y);
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);
        bullet.scale.setTo(0.1);
        bullet.rotation = turret.rotation;
        game.physics.arcade.velocityFromAngle(bullet.angle, 650, bullet.body.velocity);
        
        
    }

}

function fire2 () {

    if (game.time.now > nextFire2 && bullets2.countDead() > 0)
    {
        nextFire2 = game.time.now + fireRate2;

        var bullet = bullets2.getFirstExists(false);

        bullet.reset(turret2.x, turret2.y);
        bullet.scale.setTo(0.1);
        bullet.rotation = turret2.rotation;
        game.physics.arcade.velocityFromAngle(bullet.angle, 650, bullet.body.velocity);
        
    }

}

function tankHitTank(tank, tank2){

}

function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);

}

