class Level extends Phaser.Scene {
  constructor(config) {
    super();
  }

  preload() {
    this.load.image('tiles', 'assets/iso-64x64-building.png');
    this.load.image('button', 'assets/bomb.png');
    this.load.image('logo', 'assets/logo.png');
    this.load.tilemapTiledJSON('map', 'assets/untitled.json');
    this.load.image('test', 'assets/test.png')
  }

  create() {
    this.popupIsOpen = false;

    var map = this.add.tilemap('map');

    this.popup = this.add.sprite(700, 700, "logo");
    this.popup.alpha = 0;

    this.closePopup = this.add.sprite(this.popup.x + this.popup.width / 2, this.popup.y - this.popup.height / 2, 'button')
      .setInteractive()
      .on('pointerdown', () => this.managePopup());
    this.closePopup.alpha = 0;

    var tileset1 = map.addTilesetImage('nom', 'tiles');
    var layer1 = map.createLayer('Tile Layer 1', [tileset1]);
    var layer2 = map.createLayer('Tile Layer 2', [tileset1]);
    var layer3 = map.createLayer('Tile Layer 3', [tileset1]);

    layer2.setCollisionByProperty({ collides: true });
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    layer2.renderDebug(debugGraphics, {
      tileColor: new Phaser.Display.Color(0,255,0,255), // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(0, 0, 255, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(255, 0, 0, 255) // Color of colliding face edges
    });

    test = this.physics.add.image(500, 0, 'test')
    test.body.collideWorldBounds = true
    cursors = this.input.keyboard.createCursorKeys()
    
    this.physics.add.collider(test, layer2);


    this.clickButton = this.add.sprite(1000, 1000, 'button')
      .setInteractive()
      .on('pointerdown', () => this.managePopup());

  }

  update() {
    test.setVelocityX(0);
    test.setVelocityY(0);
  
    // Horizontal movement
    if (cursors.left.isDown) {
      test.setVelocityX(-150);
    }
    else if (cursors.right.isDown) {
      test.setVelocityX(150);
    }
  
    // Vertical movement
    if (cursors.up.isDown) {
      test.setVelocityY(-150);
    }
    else if (cursors.down.isDown) {
      test.setVelocityY(150);
    }
  }

  managePopup() {
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
}

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1300,
  height: 800,
  scene: new Level(),
  physics: {
    default: 'arcade',
  },
};

var cursors
var test

var game = new Phaser.Game(config);
