let gameState = {
  height: 13,
  width: 10,
  world: null,
  changedTiles: new Set(),
  nextChangedTiles: new Set(),
  bots: new Set(),
  activeCommand: null,
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