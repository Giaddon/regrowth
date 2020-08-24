const TILES = $("#tiles");
const BOTS = $("#bots");
const PALETTE = $("#palette");

function start() {
  setupMouseControls();
  
  gameState.world = gameState.createWorld(MAP1);
  gameState.drawWorld();

  setInterval(() => {
    gameState.cycle();
  }, 500);
}

$(start);
