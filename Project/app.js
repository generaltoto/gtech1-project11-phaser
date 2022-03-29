const config = {
  width: 800,
  height: 500,
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

var game = new Phaser.Game(config, 'gameContainer')
let test
let cursors


function preload() {
  this.load.image('test', 'img/test.png')
}

function create() {
  test = this.physics.add.image(400, 250, 'test')
  test.body.collideWorldBounds = true
  cursors = this.input.keyboard.createCursorKeys()
}

function update() {
  test.setVelocityX(0);
  test.setVelocityY(0);


  if (cursors.up.isDown) {
    test.setVelocity(0, -300)
  }
  if (cursors.down.isDown) {
    test.setVelocity(0, 300)
  }
  if (cursors.right.isDown) {
    test.setVelocity(300, 0)
  }
  if (cursors.left.isDown) {
    test.setVelocity(-300, 0)
  }
}
