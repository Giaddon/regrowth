const TILES = $("#tiles");
const BOTS = $("#bots");
const PALETTE = $("#palette");
const LOG = $("#log");

function start() {
  setupMouseControls();
  
  gameState.world = gameState.createWorld();
  gameState.drawWorld();

  setInterval(() => {
    gameState.cycle();
  }, 400);
}

$(start);
