const TILES = $("#tiles");
const BOTS = $("#bots");
const PLANTS = $("#plants");
const PALETTE = $("#palette");
const LOG = $("#log");
let gameWorld;

function start() {
  setupMouseControls();

  gameWorld = new World({mapData: MAP2});
  gameWorld.drawWorld();

  setInterval(() => {
    gameWorld.cycle();
  }, 400);
}

$(start);
