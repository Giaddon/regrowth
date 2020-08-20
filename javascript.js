const ROOT = $("#root");
const PALETTE = $("#palette");

class Tile {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.above = null;
    this.right = null;
    this.below = null;
    this.left = null;
    this.type = "wasteland";
    this.fire = 0;
  }

  printDetails() {
    console.log(`Tile ${this.y}-${this.x}.\nType: ${this.type}.\nFire: ${this.fire}.`);
  }

  evaluateChange() {
    if (this.type === "wasteland") {
      [this.above, this.right, this.below, this.left].forEach(tile => {
        if (tile) {
          if (tile.type === "water") {
            this.type = "fertile";
            gameState.nextChangedTiles.push(this);
            [this.above, this.right, this.below, this.left].forEach(tile => {
              if (tile) {
                gameState.nextChangedTiles.push(tile);
              }
            });
          } 
        };
      });
    
    } else if (this.type === "fertile") {
      [this.above, this.right, this.below, this.left].forEach(tile => {
        if (tile) {
          if (tile.type === "grassland") {
            this.type = "grassland";
            gameState.nextChangedTiles.push(this);
            [this.above, this.right, this.below, this.left].forEach(tile => {
              if (tile) {
                gameState.nextChangedTiles.push(tile);
              }
            });
          }
        };
      });

    } else if (this.type === "grassland") {
    [this.above, this.right, this.below, this.left].forEach(tile => {
      if (tile) {
        if (tile.fire > 0 && this.fire === 0) {
          this.fire = 3;
          gameState.nextChangedTiles.push(this);
          [this.above, this.right, this.below, this.left].forEach(tile => {
            if (tile) {
              gameState.nextChangedTiles.push(tile);
            }
          });
        }
      }
    });
  }

  else if (this.type === "ash") {
    [this.above, this.right, this.below, this.left].forEach(tile => {
      if (tile) {
        if (tile.type === "grassland") {
          this.type = "grassland";
          gameState.nextChangedTiles.push(this);
          [this.above, this.right, this.below, this.left].forEach(tile => {
            if (tile) {
              gameState.nextChangedTiles.push(tile);
            }
          });
        }
      };
    });
  }

  if (this.fire > 0) {
    this.fire -= 1;
    gameState.nextChangedTiles.push(this);
    if (this.fire === 0) {
      this.type = "ash";
    }
  }
}

  transform(newType) {
    switch (newType) {
      case "water":
        if (this.type !== "water") {
          this.type = newType;
          gameState.changedTiles.push(this);
        } 
        break;
      case "grassland":
        if (this.type !== "water") {
          this.type = newType;
          gameState.changedTiles.push(this);
        } 
        break;
      case "fertile":
        if (this.type === "wasteland") {
          this.type = newType;
          gameState.changedTiles.push(this);
        }
      case "changed":
        gameState.changedTiles.push(this);
      default:
    }
  }



  becomeWater() {
    this.transform("water");
    gameState.changedTiles.push(this);
    [this.above, this.right, this.below, this.left].forEach(tile => {
      if (tile) tile.transform("changed");
    });
  }

  becomeGrass() {
    if (this.type === "fertile" || this.type === "ash") {
      this.type = "grassland";
      gameState.changedTiles.push(this);
      [this.above, this.right, this.below, this.left].forEach(tile => {
        if (tile) tile.transform("changed");
      });
    }
  }

  startFire() {
    if (this.type === "grassland") {
      this.fire = 3;
      gameState.changedTiles.push(this);
      [this.above, this.right, this.below, this.left].forEach(tile => {
        if (tile) tile.transform("changed");
      });
    }
  }

  

}

let gameState = {
  height: 30,
  width: 30,
  world: null,
  changedTiles: [],
  nextChangedTiles: [],
  activeCommand: null,
  evaluateChangedTiles: () => {
    gameState.changedTiles.forEach(tile => tile.evaluateChange());
  },
  drawChangedTiles: () => {
    gameState.changedTiles.forEach(tile => gameState.drawTile(tile));
    gameState.changedTiles = gameState.nextChangedTiles;
    gameState.nextChangedTiles = [];
  },
  drawTile: tile => {
    let drawnTile = $(`#${tile.y}-${tile.x}`);
    drawnTile.attr("data-type", tile.type);
    drawnTile.attr("data-fire", tile.fire);
  },
  cycle: () => {
    gameState.evaluateChangedTiles();
    gameState.drawChangedTiles();
  },
}

function createWorld(height, width) {
  let world = [];
  for (let y = 0; y < height; y += 1) {
    let row = [];
    for (let x = 0; x < width; x += 1) {
      row.push(new Tile(x, y));
    }
    world.push(row);
  }
  
  world.forEach(row => {
    row.forEach(tile => {
      if (tile.y > 0) tile.above = world[tile.y - 1][tile.x];
      if (tile.x < width - 1) tile.right = world[tile.y][tile.x + 1];
      if (tile.y < height - 1) tile.below = world[tile.y + 1][tile.x];
      if (tile.x > 0) tile.left = world[tile.y][tile.x - 1];
    });
  });

  return world;
}

function drawWorld(world) {
  ROOT.empty();
  for (let y = 0; y < world.length; y += 1) {
    let row = $("<div class='row'></div>")
    for (let x = 0; x < world[y].length; x += 1) {
      let tile = $(`
        <div 
          class="tile" 
          id="${world[y][x].y}-${world[y][x].x}"
          data-type="${world[y][x].type}" 
          data-y="${world[y][x].y}"
          data-x="${world[y][x].x}"></div>`);
          
          tile.appendTo(row);
    }
    row.appendTo(ROOT);
  }
}



ROOT.on("click", $(".tile"), () => {
  let tile = gameState.world[event.target.dataset.y][event.target.dataset.x]
  if (gameState.activeCommand === "show-details") tile.printDetails();
  
  
  if (gameState.activeCommand === "make-water") {
    tile.becomeWater();
  }
  if (gameState.activeCommand === "make-grass") {
    tile.becomeGrass();
  }
  if (gameState.activeCommand === "make-fire") {
    tile.startFire();
  }
});

PALETTE.on("click", "div", () => {
  $(".palette-active").toggleClass("palette-active");
  if (event.target.id === "make-water") {
    gameState.activeCommand = "make-water";
    $(event.target).toggleClass("palette-active");
  }
  else if (event.target.id === "make-grass") {
    $(event.target).toggleClass("palette-active");
    gameState.activeCommand = "make-grass";
  }
  else if (event.target.id === "make-fire") {
    $(event.target).toggleClass("palette-active");
    gameState.activeCommand = "make-fire";
  }
   else if (event.target.id === "show-details") {
    $(event.target).toggleClass("palette-active");
    gameState.activeCommand = "show-details";
  }
});

gameState.world = createWorld(gameState.height, gameState.width);
drawWorld(gameState.world);

setInterval(() => {
  gameState.cycle();
}, 500);