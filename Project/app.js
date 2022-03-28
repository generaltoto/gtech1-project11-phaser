const config = {
  width: 800,
  height: 500,
  type: Phaser.AUTO,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

var game = new Phaser.Game(config)

function preload() {
  this.load.image('test', 'img/test.png')
}

function create() {
  this.add.image(100, 100, 'test')
}

function update() {

}
