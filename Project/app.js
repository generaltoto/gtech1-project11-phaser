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

var game = new Phaser.Game(config);
let test
let cursors
var platform;


function preload() {
  this.load.image('test', 'img/test.png')
  this.load.image('platform', 'img/platform.png')
}

function create() {

  platform = this.physics.add.image(500, 100, 'platform')
  platform.setImmovable(true)
  platform.body.allowGravity = false

  test = this.physics.add.image(400, 250, 'test')
  test.body.collideWorldBounds = true
  cursors = this.input.keyboard.createCursorKeys()

  /*this.physics.add.collider(
    test,
    platform,
    function (_test, _platform)
    {
      if (_test.body.touching.up && _platform.body.touching.down)
      {
        create
      }
    }
  )*/

  this.physics.add.collider(test, platform);
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
