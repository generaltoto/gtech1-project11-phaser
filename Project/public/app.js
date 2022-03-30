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
var bounds

function preload() {
  this.load.image('test', '../img/test.png')
  this.load.image('platform', '../img/platform.png')
}

function create() {
  //box border
  var cube = this.add.graphics(bounds.x, bounds.y);
  var color = 0xffff00;
  var thickness = 2;
  var alpha = 1;
  cube.lineStyle(thickness, color, alpha);
  cube.strokeRect(0, 0, 500, 500);
  this.physics.world.enable(cube);
  cube.body.setSize(500, 500)
  cube.body.setCollideWorldBounds(true);
  cube.body.setBounce(1, 1);
  test.input.boundsRect = bounds;

  //platform
  platform = this.physics.add.image(300, 150, 'platform')
  platform.setImmovable(true)
  platform.body.allowGravity = false

  //player
  test = this.physics.add.image(400, 250, 'test')
  test.body.collideWorldBounds = true
  cursors = this.input.keyboard.createCursorKeys()

  //collision
  this.physics.add.collider(test, platform);
  this.physics.add.collider(test, cube);
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
