const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: 1200,
  height: 800,
  physics: {
    default: 'arcade',
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var cursors
var test

function preload() {
  //preloading assets
  this.load.image('tiles', 'assets/iso-64x64-building.png');
  this.load.image('button', 'assets/bomb.png');
  this.load.image('logo', 'assets/logo.png');
  this.load.tilemapTiledJSON('map', 'assets/untitled.json');
  this.load.image('test', 'assets/phaser-dude.png')
}

function create() {
  //popup
  this.popupIsOpen = false;
  this.popup = this.add.sprite(700, 700, "logo");
  this.popup.alpha = 0;
  this.closePopup = this.add.sprite(this.popup.x + this.popup.width / 2, this.popup.y - this.popup.height / 2, 'button')
    .setInteractive()
    .on('pointerdown', () => this.managePopup());
  this.closePopup.alpha = 0;
  this.clickButton = this.add.sprite(1000, 1000, 'button')
    .setInteractive()
    .on('pointerdown', () => this.managePopup());

  //Map Tile iso
  var map = this.add.tilemap('map');
  var tileset1 = map.addTilesetImage('nom', 'tiles');
  var layer1 = map.createLayer('Tile Layer 1', [tileset1]);
  var layer2 = map.createLayer('Tile Layer 2', [tileset1]);

  //Debug hitbox hurtbox
  layer2.setCollisionByProperty({ collides: true });
  const debugGraphics = this.add.graphics().setAlpha(0.75);
  layer2.renderDebug(debugGraphics, {
    tileColor: new Phaser.Display.Color(0, 255, 0, 255), // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(0, 0, 255, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(255, 0, 0, 255) // Color of colliding face edges
  });


  //Player and controls
  test = this.physics.add.sprite(500, 0, 'test')
  cursors = this.input.keyboard.createCursorKeys()

  //Collision
  test.body.collideWorldBounds = true;
  this.physics.add.collider(test, layer2);

  //Camera
  this.cameras.main.startFollow(test, false);
  this.cameras.main.setZoom(2);
}

function update() {
  // Stop any previous movement from the last frame
  test.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    test.body.setVelocityX(-100);
  } else if (cursors.right.isDown) {
    test.body.setVelocityX(100);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    test.body.setVelocityY(-100);
  } else if (cursors.down.isDown) {
    test.body.setVelocityY(100);
  }
}

function managePopup() {
  //popup fonction
  if (this.popupIsOpen != true) {
    this.popupIsOpen = true;
    this.popup.alpha = 1;
    this.closePopup.alpha = 1;
    return;
  }
  this.popup.alpha = 0;
  this.closePopup.alpha = 0;
  this.popupIsOpen = false;
}