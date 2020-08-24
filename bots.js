class Bot {
  constructor(y, x, battery = 1) {
    this.y = y;
    this.x = x;
    this.battery = battery
    this.myTile = gameState.getTile(y, x);
  }

  startUp() {
    gameState.addBot(this);
    this.myTile.add(this);
  }

  shutDown() {
    this.myTile.add("botCorpse");
    this.myTile.remove(this);
    gameState.removeBot(this);
  }

}

class Pumpbot extends Bot {
  constructor(y, x) {
    super(y, x);
    this.type = "pumpbot";
  }

  run() {
    this.myTile.transform("water");
    this.shutDown();
  }
}

class Cleanbot extends Bot {
  constructor(y, x) {
    super(y, x, 7)
    this.type = "cleanbot"
    this.targets = [];
    this.validTargets = new Set(["wasteland", "grassland"]);
  }

  findTargets() {
    this.myTile.neighbors.forEach(tile => {
      if (this.validTargets.has(tile.type)) {
        this.targets.push(tile);
      }
    })
   }

  run() {
    this.findTargets();
    if (this.battery === 0) this.shutDown();
    else if (this.targets.length > 0) {
      this.myTile.remove(this);
      let targetIndex = Math.floor(Math.random() * this.targets.length);
      this.myTile = this.targets[targetIndex];
      if (this.myTile.contains.has("botCorpse")) {
        this.myTile.remove("botCorpse");
        this.battery += 2;
      } 
      this.targets = [];
      this.y = this.myTile.y;
      this.x = this.myTile.x;
      this.myTile.add(this);
      this.myTile.operations.add("clean");
      gameState.changedTiles.add(this.myTile);  
    }
    this.battery -= 1;
  }
}

class Digbot extends Bot {
  constructor(y, x, direction="down") {
    super(y, x, 2)
    this.type = "digbot"
    this.direction = direction;
    this.target = null;
  }

  canMove() {
    switch (this.direction) {
      case "up":
        if (this.myTile.above) {
          this.target = this.myTile.above;
          return true;
        }
        return false;
      case "right":
        if (this.myTile.right) {
          this.target = this.myTile.right;
          return true;
        } 
        return false;
      case "down":
        if (this.myTile.below) {
          this.target = this.myTile.below;
          return true;
        } 
        return false;
      case "left":
        if (this.myTile.left) {
          this.target = this.myTile.left;
          return true;
        } 
        return false;
      default:
        return false;
    }
  }

  run() { 
    this.myTile.transform("lower");
    
    if (this.battery === 0) {
      this.shutDown();
    
    } else if (this.canMove()) {
      if (this.myTile.contains.has("botCorpse")) {
        this.battery += 2;
        this.myTile.remove("botCorpse");
      }
      this.myTile.remove(this);
      this.myTile = this.target;
      this.y = this.myTile.y;
      this.x = this.myTile.x;
      this.myTile.add(this);
    }
    this.battery -= 1;
  }
}