class Level extends Phaser.Scene {
  constructor(config) {
    super();
  }

  preload() {
    this.load.image('tiles', 'assets/iso-64x64-building.png');
    this.load.image('button', 'assets/bomb.png');
    this.load.image('logo', 'assets/logo.png');
    this.load.tilemapTiledJSON('map', 'assets/untitled.json');
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
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    this.clickButton = this.add.sprite(1000, 1000, 'button')
      .setInteractive()
      .on('pointerdown', () => this.managePopup());

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
  height: 1300,
  scene: new Level()
};

var game = new Phaser.Game(config);
