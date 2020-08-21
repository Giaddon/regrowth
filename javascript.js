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
    this.aboveRight = null;
    this.aboveLeft = null;
    this.belowRight = null;
    this.belowLeft = null;
    this.neighbors = [];
    this.type = "wasteland";
    this.fire = 0;
    this.height = 1;
    this.contains = new Set();
    this.operations = new Set();
  }

  printDetails() {
    console.log(`Tile ${this.y}-${this.x}.
    Type: ${this.type}.
    Fire: ${this.fire}.
    Height: ${this.height}.`);
  }

  evaluateChange() {
    //Water flow
    if (this.type !== "water") {
      this.neighbors.forEach(tile => {
        if ((tile.height > this.height || this.height === 0) && tile.type === "water") {
          this.transform("water");
        }
      })
    }

    // Cleanbots
    if (this.operations.has("clean")) {
      this.operations.delete("clean");
      if (this.type === "wasteland") this.transform("fertile");
      else if (this.type === "grassland") this.transform("wasteland");
    }
    
    if (this.fire > 0) {
      this.fire -= 1;
      gameState.nextChangedTiles.push(this);
      if (this.fire === 0) {
        this.type = "ash";
      }
    }
    
    // if (this.type === "wasteland") {
    //   this.neighbors.forEach(tile => {
    //     if (tile) {
    //       if (tile.type === "water") {
    //         this.type = "fertile";
    //         gameState.nextChangedTiles.push(this);
    //         this.neighbors.forEach(tile => {
    //           if (tile) {
    //             gameState.nextChangedTiles.push(tile);
    //           }
    //         });
    //       } 
    //     };
    //   });
    
    // } else 
    
    if (this.type === "fertile") {
      this.neighbors.forEach(tile => {
        if (tile) {
          if (tile.type === "grassland") {
            this.type = "grassland";
            gameState.nextChangedTiles.push(this);
            this.neighbors.forEach(tile => {
              if (tile) {
                gameState.nextChangedTiles.push(tile);
              }
            });
          }
        };
      });

    } else if (this.type === "grassland") {
    this.neighbors.forEach(tile => {
      if (tile) {
        if (tile.fire > 0 && this.fire === 0) {
          this.fire = 3;
          gameState.nextChangedTiles.push(this);
          this.neighbors.forEach(tile => {
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

  }

  updateNeighbors() {
    this.neighbors.forEach(tile => gameState.nextChangedTiles.push(tile));
  }

  transform(newType) {
    switch (newType) {
      case "wasteland": 
        if (this.type !== "wasteland") {
            this.type = newType;
            gameState.changedTiles.push(this);
          } 
        this.updateNeighbors();
        break;
      case "water": 
        if (this.type !== "water") {
            this.type = newType;
            gameState.changedTiles.push(this);
          } 
        this.updateNeighbors();
        break;
      case "grassland":
        if (this.type === "fertile") {
          this.type = newType;
          gameState.changedTiles.push(this);
        }
        this.updateNeighbors(); 
        break;
      case "fertile":
        if (this.type === "wasteland") {
          this.type = newType;
          gameState.changedTiles.push(this);
        }
        this.updateNeighbors(); 
        break;
      case "raise":
        if (this.height < 3) {
          this.height += 1;
          gameState.changedTiles.push(this);
          this.updateNeighbors(); 
        }
        break;
      case "lower":
        if (this.height > 0) {
          this.height -= 1;
          gameState.changedTiles.push(this);
          this.updateNeighbors(); 
        }
        break;
      case "changed":
        gameState.nextChangedTiles.push(this);
      default:
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

class Cleanbots {
  constructor(y,x) {
    this.y = y;
    this.x = x;
    this.battery = 7;
    this.targets = [];
    this.validTargets = new Set(["wasteland", "grassland"]);
  }

  findTargets() {
    gameState.world[this.y][this.x].neighbors.forEach(tile => {
      if (this.validTargets.has(tile.type)) {
        this.targets.push(tile);
      }
    })
   }

  move() {
    gameState.world[this.y][this.x].contains.delete(this); 
    this.findTargets();
    if (this.battery === 0) {
      gameState.world[this.y][this.x].contains.add("botCorpse");
      gameState.bots.delete(this);
    } else if (this.targets.length > 0) {
      let targetIndex = Math.floor(Math.random() * this.targets.length);
      let target = this.targets[targetIndex];
      if (target.type === "grassland") {
        this.battery += 3;
      }
      this.targets = [];
      this.y = target.y;
      this.x = target.x;
      target.contains.add(this);
      target.operations.add("clean");
      gameState.changedTiles.push(target);
      
    }
    this.battery -= 1;
  }
}


let gameState = {
  height: 15,
  width: 15,
  world: null,
  changedTiles: [],
  nextChangedTiles: [],
  bots: new Set(),
  activeCommand: null,
  createWorld: () => {
    let world = [];
    
    for (let y = 0; y < gameState.height; y += 1) {
      let row = [];
      for (let x = 0; x < gameState.width; x += 1) {
        row.push(new Tile(x, y));
      }
      world.push(row);
    }
    
    world.forEach(row => {
      row.forEach(tile => {
        if (tile.y > 0) {
          tile.above = world[tile.y - 1][tile.x];
          tile.neighbors.push(world[tile.y - 1][tile.x]);
          if (tile.x < gameState.width - 1) {
            tile.aboveRight = world[tile.y - 1][tile.x + 1];
            tile.neighbors.push(world[tile.y - 1][tile.x + 1]);
          }
          if (tile.x > 0) {
            tile.aboveLeft = world[tile.y - 1][tile.x - 1];
            tile.neighbors.push(world[tile.y - 1][tile.x - 1]);
          }
        } 
        if (tile.x < gameState.width - 1) {
          tile.right = world[tile.y][tile.x + 1];
          tile.neighbors.push(world[tile.y][tile.x + 1]);
        } 
        if (tile.y < gameState.height - 1) {
          tile.below = world[tile.y + 1][tile.x];
          tile.neighbors.push(world[tile.y + 1][tile.x]);
          if (tile.x < gameState.width - 1) {
            tile.belowRight = world[tile.y + 1][tile.x + 1];
            tile.neighbors.push(world[tile.y + 1][tile.x + 1]);
          }
          if (tile.x > 0) {
            tile.belowLeft = world[tile.y + 1][tile.x - 1];
            tile.neighbors.push(world[tile.y + 1][tile.x - 1]);
          }
        } 
        if (tile.x > 0) {
          tile.left = world[tile.y][tile.x - 1];
          tile.neighbors.push(world[tile.y][tile.x - 1]);
        } 
      });
    });

    return world;
  },
  drawWorld: () => {
    ROOT.empty();
    for (let y = 0; y < gameState.world.length; y += 1) {
      let row = $("<div class='row'></div>")
      for (let x = 0; x < gameState.world[y].length; x += 1) {
        let tile = $(`
          <div 
            class="tile" 
            id="${gameState.world[y][x].y}-${gameState.world[y][x].x}"
            data-type="${gameState.world[y][x].type}" 
            data-height="${gameState.world[y][x].height}"
            data-y="${gameState.world[y][x].y}"
            data-x="${gameState.world[y][x].x}"></div>`);
            
            tile.appendTo(row);
      }
      row.appendTo(ROOT);
    }
  },
  evaluateChangedTiles: () => {
    gameState.changedTiles.forEach(tile => tile.evaluateChange());
    gameState.bots.forEach(bot => bot.move());
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
    drawnTile.attr("data-height", tile.height);
  },
  cycle: () => {
    gameState.evaluateChangedTiles();
    gameState.drawChangedTiles();
  },
}

ROOT.on("click", $(".tile"), () => {
  let tile = gameState.world[event.target.dataset.y][event.target.dataset.x]
  switch (gameState.activeCommand) {
    case "show-details":
      tile.printDetails();
      break;
    case "make-water":
      tile.transform("water");
      break;
    case "make-grass":
      tile.transform("grassland");
      break;
    case "raise":
      tile.transform("raise");
      break;
    case "lower":
      tile.transform("lower");
      break;
    case "make-fire":
      tile.startFire();
      break;
    case "add-cleanbot":
      let newBot = new Cleanbots(tile.y, tile.x);
      tile.contains.add(newBot);
      tile.operations.add("clean");
      gameState.bots.add(newBot);
      gameState.changedTiles.push(tile);
      break;
    default:
      console.log("No command selected."); 
  }
});

// Clicking on commands in the command palette.
PALETTE.on("click", "div", () => {
  $(".palette-active").toggleClass("palette-active");
  switch (event.target.id) {
    case "make-water":
      gameState.activeCommand = "make-water";
      $(event.target).toggleClass("palette-active");
      break;
    case "make-grass":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "make-grass";
      break;
    case "make-fire":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "make-fire";
      break;
    case "add-cleanbot":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "add-cleanbot";
      break;
    case "raise":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "raise";
      break;
    case "lower":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "lower";
      break;
    case "show-details":
      $(event.target).toggleClass("palette-active");
      gameState.activeCommand = "show-details";
      break;
    default:
      console.log("Command not recognized.");
  }
});

gameState.world = gameState.createWorld();
gameState.drawWorld();

setInterval(() => {
  gameState.cycle();
}, 500);