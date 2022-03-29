const config = {
  width: 1200,
  height: 800,
  parent: 'gameContainer',
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

var game = new Phaser.Game(config);
let test
let cursors
var platform
var graphics


function preload() {
  this.load.image('test', 'img/test.png')
  this.load.image('platform', 'img/platform.png')
}

function create() {

  graphics = this.add.graphics();

  var thickness = 2;
  var color = 0x00ff00;
  var alpha = 1;

  graphics.lineStyle(thickness, color, alpha);
  graphics.strokeRect(100, 32, 600, 600);

  platform = this.physics.add.image(400, 150, 'platform')
  platform.setImmovable(true)
  platform.body.allowGravity = false

  test = this.physics.add.image(400, 250, 'test')
  test.body.collideWorldBounds = true
  cursors = this.input.keyboard.createCursorKeys()

  this.physics.add.collider(test, platform);
  this.physics.add.collider(test, graphics);
}

function update() {
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
