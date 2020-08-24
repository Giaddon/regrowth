function setupMouseControls() {
  TILES.on("click", $(".tile"), (event) => {
    let tile = gameState.getTile(event.target.dataset.y, event.target.dataset.x);
    switch (gameState.activeCommand) {
      case "show-details":
        tile.printDetails();
        break;
      case "make-water":
        let newBot = new Pumpbot(event.target.dataset.y, event.target.dataset.x);
        newBot.startUp();
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
      default:
        console.log("No command selected."); 
    }
  });

  //draggables
  TILES.on("mousedown", $(".tile"), () => {
    $(this).data("commandData", {x: event.pageX, y: event.pageY, tile: gameState.getTile(event.target.dataset.y, event.target.dataset.x)});
  }).on("mouseup", () => {
    let point0 = {x: $(this).data('commandData').x, y: $(this).data('commandData').y};
    let tile = $(this).data('commandData').tile;
    let point1 =  {x: event.pageX, y: event.pageY};
    let matrix = [point1.x - point0.x, point1.y - point0.y]
    let direction;
    if (Math.abs(matrix[0]) > Math.abs(matrix[1])) {
      direction = matrix[0] > 0 ? "right" : "left";
    } else {
      direction = matrix[1] > 0 ? "down" : "up";
    }
    switch (gameState.activeCommand) {
      case "add-digbot": {
        let newBot = new Digbot(tile.y, tile.x, direction);
        newBot.startUp();
        break; }
      default:
        console.log("no command selected");
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
}