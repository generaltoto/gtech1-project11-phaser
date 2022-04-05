const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: 1280,
  height: 640,
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
var tileSize = 64;

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
  this.layer1 = map.createLayer('Tile Layer 1', [tileset1]);
  this.layer2 = map.createLayer('Tile Layer 2', [tileset1]);

  //Debug hitbox hurtbox
  // layer2.setCollisionByProperty({ collides: true });
  // const debugGraphics = this.add.graphics().setAlpha(0.75);
  // layer2.renderDebug(debugGraphics, {
  //   tileColor: new Phaser.Display.Color(0, 255, 0, 255), // Color of non-colliding tiles
  //   collidingTileColor: new Phaser.Display.Color(0, 0, 255, 255), // Color of colliding tiles
  //   faceColor: new Phaser.Display.Color(255, 0, 0, 255) // Color of colliding face edges
  // });

  //Player and controls
  test = this.physics.add.sprite(535, 2, 'test')
  cursors = this.input.keyboard.createCursorKeys()
  this.MousePointer = this.input.activePointer;
  this.playerIsMoving = false;
  this.path = [];
  this.nextTileInPath = undefined;

  //Collision
  test.body.collideWorldBounds = true;
  this.physics.add.collider(test, this.layer2);

  // Camera
  // this.cameras.main.startFollow(test, false);
  // this.cameras.main.setZoom(2);
  // console.log(this.cameras)

  //Coordinate
  text = this.add.text(10, 10, 'Cursors to move', { font: '16px Courier', fill: '#00ff00' }).setScrollFactor(0);
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

  text.setText([
    'screen x: ' + this.input.x,
    'screen y: ' + this.input.y,
    'world x: ' + this.input.mousePointer.worldX,
    'world y: ' + this.input.mousePointer.worldY,
  ]);

  if (this.MousePointer.isDown && !this.playerIsMoving) {
    this.playerIsMoving = true;
    var coordsPointerInMap = this.layer1.worldToTileXY(this.MousePointer.x, this.MousePointer.y);
    coordsPointerInMap.x = Math.floor(coordsPointerInMap.x);
    coordsPointerInMap.y = Math.floor(coordsPointerInMap.y);
    var coordsPlayerInMap = this.layer1.worldToTileXY(test.x, test.y);
    coordsPlayerInMap.x = Math.floor(coordsPlayerInMap.x);
    coordsPlayerInMap.y = Math.floor(coordsPlayerInMap.y);
    this.path = findPathTo(coordsPlayerInMap, coordsPointerInMap, this.layer1, this.layer2);
    console.log(this.path);
    console.log(this.path.length);
  }

  if (this.playerIsMoving) {
    let dx = 0;
    let dy = 0;

    if (!this.nextTileInPath && this.path.length > 0) {
      this.nextTileInPath = getNextTileInPath(this.path);
    }
    else if (!this.nextTileInPath && this.path.length <= 0) {
      this.playerIsMoving = false;
      return;
    }

    this.physics.moveTo(test, this.nextTileInPath.x, this.nextTileInPath.y, 100)

    dx = this.nextTileInPath.x - test.x;
    dy = this.nextTileInPath.y - test.y;

    if (Math.abs(dx) < 5) {
      dx = 0;
    }

    if (Math.abs(dy) < 5) {
      dy = 0;
    }

    if (dx === 0 && dy === 0) {
      if (this.path.length > 0) {
        this.nextTileInPath = this.path.shift();
      }
      else {
        this.playerIsMoving = false;
      }
    }
  }
}

/*
function estimatedCostBetween(ColA, RowA, ColB, RowB){
  return Math.abs(ColA - ColB) + Math.abs(RowA - RowB);
}
*/

function coordsToKey(x, y) {
  return x + 'xXx' + y
}

function findPathTo(start, target, groundLayer, collisionsLayer) {
  console.log(target)

  if (!groundLayer.getTileAt(target.x, target.y)) {
    return [];
  }

  if (collisionsLayer.layer.data[target.x][target.y].index !== -1) {
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

      if (collisionTile) {
        continue;
      }

      const key = coordsToKey(neighbor.x, neighbor.y);

      if (key in parentForKey) {
        continue;
      }

      parentForKey[key] = { key: currentKey, position: { x: currentX, y: currentY } };

      queue.push(neighbor);

      if (currentKey === targetKey) {
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

  currentKey = targetKey;
  currentPos = parentForKey[targetKey].position;

  while (currentKey !== startKey) {
    console.log(groundLayer.getTileAt(currentPos.x, currentPos.y));
    var pos = groundLayer.tileToWorldXY(currentPos.x, currentPos.y, null, this.cameras);

    path.push(pos);

    currentKey = parentForKey[currentKey].key;
    currentPos = parentForKey[currentKey].position;
  }

  return path.reverse();
}

function getNextTileInPath(path) {
  if (!path || path.length <= 0) {
    return;
  }

  return path.shift();
}

/*
function movePlayerToTile(startCol, startRow, destCol, destRow, mapLayer, scenePhysics){
  var visitedTiles = [];
  var currentTile = {x:startCol, y:startRow, costToHere:0, costToDest:destCol + destRow, cost:1};
  var previousTile;
  while(currentTile.x !== destCol && currentTile.y !== destRow){
    foundNextNode = false;
    
    const neighbors = [{x:currentTile.x + 1, y:currentTile.y, costToHere:currentTile.costToHere + 1, costToDest: estimatedCostBetween(currentTile.x + 1, currentTile.y, destCol, destRow), cost:1},             //droite
                       {x:currentTile.x - 1, y:currentTile.y, costToHere:currentTile.costToHere + 1, costToDest: estimatedCostBetween(currentTile.x - 1, currentTile.y, destCol, destRow), cost:1},             //gauche
                       {x:currentTile.x, y:currentTile.y - 1, costToHere:currentTile.costToHere + 1, costToDest: estimatedCostBetween(currentTile.x, currentTile.y + 1, destCol, destRow), cost:1},             //haut
                       {x:currentTile.x, y:currentTile.y + 1, costToHere:currentTile.costToHere + 1, costToDest: estimatedCostBetween(currentTile.x, currentTile.y - 1, destCol, destRow), cost:1},             //bas
                       {x:currentTile.x + 1, y:currentTile.y - 1, costToHere:currentTile.costToHere + 0.5, costToDest: estimatedCostBetween(currentTile.x + 1, currentTile.y - 1, destCol, destRow), cost:0.5}, //haut-droite
                       {x:currentTile.x - 1, y:currentTile.y - 1, costToHere:currentTile.costToHere + 0.5, costToDest: estimatedCostBetween(currentTile.x - 1, currentTile.y - 1, destCol, destRow), cost:0.5}, //haut-gauche
                       {x:currentTile.x + 1, y:currentTile.y + 1, costToHere:currentTile.costToHere + 0.5, costToDest: estimatedCostBetween(currentTile.x + 1, currentTile.y + 1, destCol, destRow), cost:0.5}, //bas-droite
                       {x:currentTile.x - 1, y:currentTile.y + 1, costToHere:currentTile.costToHere + 0.5, costToDest: estimatedCostBetween(currentTile.x - 1, currentTile.y + 1, destCol, destRow), cost:0.5}, //bas-gauche
    ]
    for(i=0; i < neighbors.length; i++){
      if((neighbors[i].costToHere + neighbors[i].costToDest < currentTile.costToHere + currentTile.costToDest)
          && mapLayer.layer.data[neighbors[i].x + 10*neighbors[i].y] !== 3){
        previousTile = currentTile;
        currentTile = neighbors[i];
        visitedTiles.push(currentTile);
        foundNextNode = true;
      }
    }
    if(!foundNextNode){
      currentTile = previousTile;
    }
  }
  for(i=0; i<visitedTiles.length; i++){
    scenePhysics.moveTo(player, mapLayer.offsetx + visitedTiles[i].x * tileSize, visitedTiles[i].y * 32);
  }
}
*/

function updateMap() {
  var origin = map.getTileAtWorldXY(this.test.x, this.test.y);

  map.forEachTile(function (tile) {
    var dist = Phaser.Math.Distance.Chebyshev(
      origin.x,
      origin.y,
      tile.x,
      tile.y
    );

    tile.setAlpha(1 - 0.1 * dist);
  });
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