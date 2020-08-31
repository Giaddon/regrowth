class Plant {
  constructor({y, x, world}) {
    this.y = y;
    this.x = x;
    this.world = world;
    this.myTile = world.getTile(y, x);
  }

  sprout() {
    this.myTile.grow(this);
  }

  die() {
    this.myTile.wither(this);
    this.world.clearPlant(this);
    this.myTile.add("plant matter");
  }
}


class Grass extends Plant{
  constructor({y, x, world}) {
    super({y, x, world})
    this.type = "grass";
  }

  live() {
    if (this.myTile.type === "dirt" &&
        this.myTile.neighbors.some(tile => tile.type === "water")) {
          //this.spread();
    } else {
      this.die();
    }
  }

}

/** Grass, shrubs, trees? */