
const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: 1600,
  height: 800,
  physics: {
    default: 'arcade',
  },
  scene: {
    preload: preload,
    create: create,
    update: update,

  },
}


var game = new Phaser.Game(config);
var cursors, player
var tileSize = 64;
let mapHeight = 6
var focusedTile = null;

function preload() {
  //preloading assets
  this.load.image('ground', 'Assets/allassets.png');
  this.load.tilemapTiledJSON('map', 'Assets/map.json');
  this.load.image('player', 'Assets/phaser-dude.png')
}

function create() {

  /* MAP */
  let map = this.add.tilemap('map')
  var tileset1 = map.addTilesetImage('allassets', 'ground');
  this.layer1 = map.createLayer('layer1', [tileset1]);
  this.layer2 = map.createLayer('layer2', [tileset1]);
  this.layer3 = map.createLayer('layer3', [tileset1]);
  this.layer4 = map.createLayer('layer4', [tileset1]);
  this.layer5 = map.createLayer('layer5', [tileset1]);


  /* PLAYER & POINTER */
  let playerPos = mapToWorld(20, 25, this.layer1.layer)
  this.player = this.physics.add.sprite(playerPos.x, playerPos.y, 'player')
  cursors = this.input.keyboard.createCursorKeys()
  this.MousePointer = this.input.activePointer;
  this.playerIsMoving = false;
  this.path = [];
  this.nextTileInPath = undefined;
}

var focusedTile = null;
var focusedTile2 = null;

function worldToMap(x, y, layer) {
  var cell = { x: 0, y: 0 };

  var x_pos = (x - 16 - layer.x) / layer.baseTileWidth;
  var y_pos = (y - 24 - layer.y) / layer.baseTileHeight;

  cell.y = Math.round(y_pos - x_pos);
  cell.x = Math.round(x_pos + y_pos);

  return cell;
}

function mapToWorld(x, y, layer) {
  var pos = { x: 0, y: 0 };

  pos.x = (x - y) * layer.baseTileWidth / 2 + 16 + layer.x;
  pos.y = (x + y) * layer.baseTileHeight / 2 + 24 + layer.y;

  return pos;
}


function update() {
  //Z-Index
  this.player.setDepth(this.player.z = 1)
  this.layer2.setDepth(this.layer2.z = 1)
  this.layer3.setDepth(this.layer3.z = 2)
  this.layer4.setDepth(this.layer4.z = 2)
  this.layer5.setDepth(this.layer5.z = 2)

  // Stop any previous movement from the last frame
  this.player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    this.player.body.setVelocityX(-100);
  } else if (cursors.right.isDown) {
    this.player.body.setVelocityX(100);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    this.player.body.setVelocityY(-100);
  } else if (cursors.down.isDown) {
    this.player.body.setVelocityY(100);
  }

  var coordsPointerInMap = worldToMap(this.MousePointer.x, this.MousePointer.y, this.layer1.layer);
  if (focusedTile) {
    focusedTile.setVisible(true);
  }
  if (coordsPointerInMap.x >= 0 && coordsPointerInMap.y >= 0 && coordsPointerInMap.x < this.layer1.layer.width && coordsPointerInMap.y < this.layer1.layer.height) {
    focusedTile = this.layer1.getTileAt(coordsPointerInMap.x, coordsPointerInMap.y);
    focusedTile.setVisible(false);
  }

  if (this.MousePointer.isDown && !this.playerIsMoving) {
    var coordsPointerInMap = worldToMap(this.MousePointer.x, this.MousePointer.y, this.layer1.layer);
    var coordsPlayerInMap = worldToMap(this.player.x, this.player.y + this.player.height / 2, this.layer1.layer);
    if (focusedTile && this.layer1.getTileAt(coordsPointerInMap.x, coordsPointerInMap.y).index != -1) { focusedTile.setVisible(true); }
    this.playerIsMoving = true;
    this.path = findPathTo(coordsPlayerInMap, coordsPointerInMap, this.layer1, this.layer2);
    if (this.path.length > 0) {
      for (let i = 0; i < this.path.length; i++) {
        this.layer1.getTileAt(this.path[i].x, this.path[i].y).setVisible(false);
      }
    }
  }

  if (this.playerIsMoving) {
    let dx = 0;
    let dy = 0;

    if (!this.nextTileInPath && this.path.length > 0) {
      this.nextTileInPath = getNextTileInPath(this.path);
    }
    else if (!this.nextTileInPath && this.path.length === 0) {
      this.playerIsMoving = false;
      return;
    }

    var nextPos = mapToWorld(this.nextTileInPath.x, this.nextTileInPath.y, this.layer1.layer);
    nextPos.y -= this.player.height / 2;
    this.physics.moveTo(this.player, nextPos.x, nextPos.y, 100);

    dx = nextPos.x - this.player.x;
    dy = nextPos.y - this.player.y;

    if (Math.abs(dx) < 5) {
      dx = 0;
    }

    if (Math.abs(dy) < 5) {
      dy = 0;
    }

    if (dx === 0 && dy === 0) {
      if (this.path.length > 0) {
        this.layer1.getTileAt(this.nextTileInPath.x, this.nextTileInPath.y).setVisible(true);
        this.nextTileInPath = this.path.shift();
      }
      else {
        this.playerIsMoving = false;
        this.nextTileInPath = null;
      }
    }
  }

  this.text.setText([
    'screen x: ' + this.input.x,
    'screen y: ' + this.input.y,
    'world x: ' + this.input.mousePointer.worldX,
    'world y: ' + this.input.mousePointer.worldY
  ]);

  // if (worldToMap(this.player.x, y, layer) == 0,0) {
  //   console.log("yes");
  // }
}

function coordsToKey(x, y) {
  return x + 'xXx' + y
}

function findPathTo(start, target, groundLayer, collisionsLayer) {

  if (!groundLayer.getTileAt(target.x, target.y)) {
    return [];
  }

  if (collisionsLayer.layer.data[target.y][target.x].index !== -1) {
    return [];
  }

  var queue = [];
  var parentForKey = {};

  const startKey = coordsToKey(start.x, start.y);
  const targetKey = coordsToKey(target.x, target.y);

  parentForKey[startKey] = { key: '', position: { x: -1, y: -1 } }

  queue.push(start);

  while (queue.length > 0) {
    const currentTile = queue.shift();
    const currentX = currentTile.x;
    const currentY = currentTile.y;
    const currentKey = coordsToKey(currentX, currentY);

    const neighbors = [{ x: currentX, y: currentY + 1 }, //haut
    { x: currentX, y: currentY - 1 }, //bas
    { x: currentX + 1, y: currentY }, //droite
    { x: currentX - 1, y: currentY }  //gauche
    ]

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const groundTile = groundLayer.getTileAt(neighbor.x, neighbor.y);
      const collisionTile = collisionsLayer.getTileAt(neighbor.x, neighbor.y);

      if (!groundTile) {
        continue;
      }

      if (collisionTile !== null) {
        continue;
      }

      const neighborKey = coordsToKey(neighbor.x, neighbor.y);

      if (neighborKey in parentForKey) {
        continue;
      }

      parentForKey[neighborKey] = { key: currentKey, position: { x: currentX, y: currentY } };

      queue.push(neighbor);

      if (neighborKey === targetKey) {
        break;
      }
    }
  }

  var path = [];
  var currentPos;
  var currentKey;

  if (!parentForKey[targetKey]) {
    return [];
  }

  path.push(target);
  currentKey = targetKey;
  currentPos = parentForKey[targetKey].position;

  while (currentKey !== startKey) {

    path.push(currentPos);

    currentKey = parentForKey[currentKey].key;
    currentPos = parentForKey[currentKey].position;
  }
  return path.reverse();
}

function getNextTileInPath(path) {
  if (!path || path.length === 0) {
    return;
  }

  return path.shift();
}

