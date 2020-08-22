const TILES = $("#tiles");
const BOTS = $("#bots");
const PALETTE = $("#palette");

class Cleanbot {
  constructor(y,x) {
    this.type = "cleanbot"
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

  run() {
    gameState.world[this.y][this.x].contains.delete(this); 
    this.findTargets();
    if (this.battery === 0) {
      gameState.world[this.y][this.x].contains.add("botCorpse");
      gameState.bots.delete(this);
    } else if (this.targets.length > 0) {
      let targetIndex = Math.floor(Math.random() * this.targets.length);
      let target = this.targets[targetIndex];
      // if (target.type === "grassland") {
      //   this.battery += 3;
      // }
      this.targets = [];
      this.y = target.y;
      this.x = target.x;
      target.contains.add(this);
      target.operations.add("clean");
      gameState.changedTiles.add(target);
      
    }
    this.battery -= 1;
  }
}

class Digbot {
  constructor(y,x, direction="right") {
    this.y = y;
    this.x = x;
    this.battery = 5;
    this.type = "digbot"
    this.direction = direction;
    this.target = null;
    this.myTile = gameState.world[y][x];
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
      this.myTile.contains.delete(this);
      this.myTile.contains.add("botCorpse");
      gameState.bots.delete(this);
    
    } else if (this.canMove()) {
      if (this.myTile.contains.has("botCorpse")) {
        this.battery += 2;
        this.myTile.contains.delete("botCorpse");
      }
      this.myTile.contains.delete(this);
      this.myTile = this.target;
      this.y = this.myTile.y;
      this.x = this.myTile.x;
      this.myTile.contains.add(this);
    }
    this.battery -= 1;
  }
}

let gameState = {
  height: 15,
  width: 15,
  world: null,
  changedTiles: new Set(),
  nextChangedTiles: new Set(),
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
    TILES.empty();
    BOTS.empty();
    for (let y = 0; y < gameState.world.length; y += 1) {
      let tileRow = $("<div class='row'></div>")
      let botRow = $("<div class='row'></div>")
      for (let x = 0; x < gameState.world[y].length; x += 1) {
        let tile = $(`
          <div 
            class="tile" 
            id="${gameState.world[y][x].y}-${gameState.world[y][x].x}"
            data-type="${gameState.world[y][x].type}" 
            data-height="${gameState.world[y][x].height}"
            data-y="${gameState.world[y][x].y}"
            data-x="${gameState.world[y][x].x}"></div>`);
        tile.appendTo(tileRow);
        
        let botCell = $(`
          <div class="botCell"></div>`);
        let bot = $(`
          <div
            class="bot"
            id="bot-${gameState.world[y][x].y}-${gameState.world[y][x].x}"
            data-bot="empty"></div>`);
        botCell.appendTo(botRow);
        bot.appendTo(botCell);
        
      }
      tileRow.appendTo(TILES);
      botRow.appendTo(BOTS);
    }
  },
  evaluateChangedTiles: () => {
    gameState.bots.forEach(bot => {
      gameState.clearBot(bot);
      bot.run();
      gameState.drawBot(bot)
    });
    gameState.changedTiles.forEach(tile => {
      tile.evaluateChange();
      gameState.drawTile(tile);
      gameState.changedTiles.delete(tile);
    });
    gameState.nextChangedTiles.forEach(tile => gameState.changedTiles.add(tile));
    gameState.nextChangedTiles.clear();
  },
  // drawChangedTiles: () => {
  //   //gameState.bots.forEach(bot => gameState.drawBot(bot));
  //   //gameState.changedTiles.forEach(tile => gameState.drawTile(tile));
  //   //gameState.changedTiles.clear();
  //   gameState.nextChangedTiles.forEach(tile => gameState.changedTiles.add(tile));
  //   gameState.nextChangedTiles.clear();
  // },
  drawTile: tile => {
    let drawnTile = $(`#${tile.y}-${tile.x}`);
    drawnTile.attr("data-type", tile.type);
    drawnTile.attr("data-fire", tile.fire);
    drawnTile.attr("data-height", tile.height);
  },
  clearBot: bot => {
    let drawnBot = $(`#bot-${bot.y}-${bot.x}`)
    drawnBot.attr("data-bot", "empty");
  },
  drawBot: bot => {
    let drawnBot = $(`#bot-${bot.y}-${bot.x}`)
    drawnBot.attr("data-bot", bot.type);
  },
  cycle: () => {
    gameState.evaluateChangedTiles();
    //gameState.drawChangedTiles();
  },
}

TILES.on("click", $(".tile"), () => {
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
    case "add-cleanbot": {
      let newBot = new Cleanbot(tile.y, tile.x);
      tile.contains.add(newBot);
      tile.operations.add("clean");
      gameState.bots.add(newBot);
      gameState.changedTiles.add(tile);
      break; }
    case "add-digbot": {
      let newBot = new Digbot(tile.y, tile.x);
      tile.contains.add(newBot);
      tile.transform("lower");
      gameState.bots.add(newBot);
      gameState.changedTiles.add(tile);
      break; }
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
      case "add-digbot":
        $(event.target).toggleClass("palette-active");
        gameState.activeCommand = "add-digbot";
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