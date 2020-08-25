class World {
  constructor({height = 20, width = 20, mapData = null}) {
    this.height = height;
    this.width = width;
    this.map = this.createMap(mapData);
    this.changedTiles = new Set();
    this.nextChangedTiles = new Set();
    this.bots = new Set();
    this.activeCommand = null;
    this.log = "";
  }

  createMap(mapData) {
    let world = [];
    
    if (mapData) {
      world = mapData;
      this.height = world.length;
      this.width = world[0].length;
    } else {
      for (let y = 0; y < this.height; y += 1) {
        let row = [];
        for (let x = 0; x < this.width; x += 1) {
          row.push(new Tile({y, x}));
        }
        world.push(row);
      }
    }

    world.forEach(row => {
      row.forEach(tile => {
        tile.world = this;
        if (tile.y > 0) {
          tile.above = world[tile.y - 1][tile.x];
          tile.neighbors.push(world[tile.y - 1][tile.x]);
          if (tile.x < this.width - 1) {
            tile.aboveRight = world[tile.y - 1][tile.x + 1];
            tile.neighbors.push(world[tile.y - 1][tile.x + 1]);
          }
          if (tile.x > 0) {
            tile.aboveLeft = world[tile.y - 1][tile.x - 1];
            tile.neighbors.push(world[tile.y - 1][tile.x - 1]);
          }
        } 
        if (tile.x < this.width - 1) {
          tile.right = world[tile.y][tile.x + 1];
          tile.neighbors.push(world[tile.y][tile.x + 1]);
        } 
        if (tile.y < this.height - 1) {
          tile.below = world[tile.y + 1][tile.x];
          tile.neighbors.push(world[tile.y + 1][tile.x]);
          if (tile.x < this.width - 1) {
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
  }

  updateLog(entry) {
    let newEntry = $(`<p>${entry}</p>`);
    newEntry.prependTo(LOG);
  }

  getTile(y,x) {
    return this.map[y][x];
  }

  addBot(bot) {
    this.bots.add(bot);
  }

  removeBot(bot) {
    this.bots.delete(bot);
  }

  drawWorld() {
    TILES.empty();
    BOTS.empty();
    for (let y = 0; y < this.height; y += 1) {
      let tileRow = $("<div class='row'></div>")
      let botRow = $("<div class='row'></div>")
      for (let x = 0; x < this.width; x += 1) {
        let tile = $(`
          <div 
            class="tile" 
            id="${this.map[y][x].y}-${this.map[y][x].x}"
            data-type="${this.map[y][x].type}" 
            data-height="${this.map[y][x].height}"
            data-y="${this.map[y][x].y}"
            data-x="${this.map[y][x].x}"></div>`);
        tile.appendTo(tileRow);
        
        let botCell = $(`
          <div class="botCell"></div>`);
        let bot = $(`
          <div
            class="bot"
            id="bot-${this.map[y][x].y}-${this.map[y][x].x}"
            data-bot="empty"></div>`);
        botCell.appendTo(botRow);
        bot.appendTo(botCell);
        
      }
      tileRow.appendTo(TILES);
      botRow.appendTo(BOTS);
    }
  }

  evaluateChangedTiles() {
    this.bots.forEach(bot => {
      this.clearBot(bot);
      bot.run();
      this.drawBot(bot)
    });
    this.changedTiles.forEach(tile => {
      tile.evaluateChange();
      this.drawTile(tile);
      this.changedTiles.delete(tile);
    });
    this.nextChangedTiles.forEach(tile => this.changedTiles.add(tile));
    this.nextChangedTiles.clear();
  }

  drawTile(tile) {
    let drawnTile = $(`#${tile.y}-${tile.x}`);
    drawnTile.attr("data-type", tile.type);
    drawnTile.attr("data-fire", tile.fire);
    drawnTile.attr("data-height", tile.height);
  }

  clearBot(bot) {
    let drawnBot = $(`#bot-${bot.y}-${bot.x}`)
    drawnBot.attr("data-bot", "empty");
  }

  drawBot(bot) {
    let drawnBot = $(`#bot-${bot.y}-${bot.x}`)
    drawnBot.attr("data-bot", bot.type);
  }
  
  cycle() {
    this.evaluateChangedTiles();
  }
} 




let gameState = {
  height: 30,
  width: 20,
  world: null,
  changedTiles: new Set(),
  nextChangedTiles: new Set(),
  bots: new Set(),
  activeCommand: null,
  log: "",
  updateLog: (entry) => {
    let newEntry = $(`<p>${entry}</p>`);
    newEntry.prependTo(LOG);
  },
  getTile: (y,x) => {
    return gameState.world[y][x];
  },
  addBot: bot => {
    gameState.bots.add(bot);
  },
  removeBot: bot => {
    gameState.bots.delete(bot);
  },
  createWorld: (mapData = null) => {
    let world = [];
    
    if (mapData) world = mapData;
    else {
      for (let y = 0; y < gameState.height; y += 1) {
        let row = [];
        for (let x = 0; x < gameState.width; x += 1) {
          row.push(new Tile({y, x}));
        }
        world.push(row);
      }
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

/** 
 * Tile type ideas:
 * 
 * Replace water with "flow" layer = water, fire, things that pass through tiles.
 * Add plant layer.
 * 
 * Tile type a combination of material, flow, other factors rather than direct (wet wasteland = mud)?
 * 
 * Dust
 * Soil / Dirt
 * Mud: wet tile
 * Ruin: remain of old civilization (maybe something tile contains?)
 * Sand
 * Rock / Stone
 * 
 * 
 */