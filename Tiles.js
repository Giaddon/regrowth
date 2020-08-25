class Tile {
  constructor({y, x, type = "wasteland", height = 1 }){
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
    this.type = type;
    this.fire = 0;
    this.height = height;
    this.contains = new Set();
    this.operations = new Set();
  }

  printDetails() {
    let contains = "Nothing."
    if (this.contains.size > 0) {
      contains = "";
      for (let thing of this.contains.values()) {
        contains += thing + " ";
      }
    }
    
    
    gameState.updateLog(`Tile ${this.y}-${this.x}.
    <br>Type: ${this.type}.
    <br>Fire: ${this.fire}.
    <br>Height: ${this.height}.
    <br>Contains: ${contains}`);
  }

  add(thing) {
    this.contains.add(thing);
  }

  remove(thing) {
    this.contains.delete(thing);
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

    // Cleanbots (should become transform("clean"))
    if (this.operations.has("clean")) {
      this.operations.delete("clean");
      if (this.type === "wasteland") this.transform("fertile");
      else if (this.type === "grassland") this.transform("wasteland");
    }
    
    if (this.fire > 0) {
      this.fire -= 1;
      gameState.nextChangedTiles.add(this);
      if (this.fire === 0) {
        this.type = "ash";
      }
    }
    
    if (this.type === "rock") {
      // rock stuff
    } 

    if (this.type === "wasteland") {
      this.neighbors.forEach(tile => {
        if (tile.type === "water") {
          this.transform("fertile");
          this.updateNeighbors();
        } 
      });
    }
    
    // } else 
    
    if (this.type === "fertile") {
      this.neighbors.forEach(tile => {
        if (tile) {
          if (tile.type === "grassland" && this.neighbors.some(tile => tile.type==="water")) {
            this.transform("grassland");
          }
        };
      });

    } else if (this.type === "grassland") {
    this.neighbors.forEach(tile => {
      if (tile) {
        if (tile.fire > 0 && this.fire === 0) {
          this.fire = 3;
          gameState.nextChangedTiles.add(this);
          this.neighbors.forEach(tile => {
            if (tile) {
              gameState.nextChangedTiles.add(tile);
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
          gameState.nextChangedTiles.add(this);
          [this.above, this.right, this.below, this.left].forEach(tile => {
            if (tile) {
              gameState.nextChangedTiles.add(tile);
            }
          });
        }
      };
    });
  }

  }

  updateNeighbors() {
    this.neighbors.forEach(tile => gameState.nextChangedTiles.add(tile));
  }

  transform(newType) {
    switch (newType) {
      case "wasteland": 
        if (this.type !== "wasteland") {
            this.type = newType;
            gameState.changedTiles.add(this);
          } 
        this.updateNeighbors();
        break;
      case "water": 
        if (this.type !== "water") {
            this.type = newType;
            gameState.changedTiles.add(this);
          } 
        this.updateNeighbors();
        break;
      case "grassland":
        if (this.type === "fertile" && this.neighbors.some((tile => tile.type === "water"))) {
          this.type = newType;
          gameState.changedTiles.add(this);
        }
        this.updateNeighbors(); 
        break;
      case "fertile":
        if (this.type === "wasteland") {
          this.type = newType;
          gameState.changedTiles.add(this);
        }
        this.updateNeighbors(); 
        break;
      case "raise":
        if (this.height < 3) {
          this.height += 1;
          gameState.changedTiles.add(this);
          this.updateNeighbors(); 
        }
        break;
      case "lower":
        if (this.height > 0) {
          this.height -= 1;
          gameState.changedTiles.add(this);
          this.updateNeighbors(); 
        }
        break;
      case "changed":
        gameState.nextChangedTiles.add(this);
      default:
    }
  }

  startFire() {
    if (this.type === "grassland") {
      this.fire = 3;
      gameState.changedTiles.add(this);
      [this.above, this.right, this.below, this.left].forEach(tile => {
        if (tile) tile.transform("changed");
      });
    }
  }
}