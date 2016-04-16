var Ghost = function(size, xPos) {
  size = parseInt(size);
  var up = 38,
    down = 40,
    left = 37,
    right = 39;
  var intersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
  };
  return {
    height: size,
    width: size,
    x: xPos,
    y: 14 * size,
    speed: size / 8,
    immune: false,
    vel: {
      x: 0,
      y: 0
    },
    image: document.getElementById("ghostcoffey"),
    scareImage: document.getElementById("ghostcoffey-scare"),
    die: function() {
      this.y = 14 * size;
      this.x = xPos;
    },
    update: function(player, map) {
      // Move to pacgongo
      var grid = map.getAstarMap();
      var finder = new PF.AStarFinder();
      var path;
      if (!player.superMode || this.immune) {
        path = finder.findPath(Math.round(this.x / BLOCK), Math.round(this.y / BLOCK),
          Math.round(player.x / BLOCK), Math.round(player.y / BLOCK), grid);
      } else {
        grid = map.getAstarMap(player);
        if (player.y < HEIGHT / 2) {
          path = finder.findPath(Math.round(this.x / BLOCK), Math.round(this.y / BLOCK),
            Math.round(WIDTH / 2 / BLOCK), 29, grid);
        } else {
          path = finder.findPath(Math.round(this.x / BLOCK), Math.round(this.y / BLOCK),
            1, 1, grid);
        }
      }
      if (path[1]) {
        if (path[1][0] * BLOCK < this.x) { // left
          this.vel.x = -this.speed;
        } else if (path[1][0] * BLOCK > this.x) { // right
          this.vel.x = this.speed;
        } else {
          this.vel.x = 0;
        }

        if (path[1][1] * BLOCK < this.y) { // up
          this.vel.y = -this.speed;
        } else if (path[1][1] * BLOCK > this.y) { // down
          this.vel.y = this.speed;
        } else {
          this.vel.y = 0;
        }
      }

      // Handle player collision
      if (intersect(player.x, player.y, player.width, player.height, this.x, this.y, this.width, this.height)) {
        if (player.superMode && !this.immune) {
          player.score += 200;
          this.die();
          this.immune = true;
        } else {
          player.die();
        }
      }
      if(!player.superMode)
        this.immune = false;
      this.x += this.vel.x;
      this.y += this.vel.y;
    },
    draw: function(ctx) {
      var time = Date.now() - player.superModeStartTime;
      if (!this.immune && player.superMode && (time < 4000 || (time > 4500 && time < 5000) || (6000 > time && time > 5500))) {
        ctx.drawImage(this.scareImage, this.x, this.y);
      } else
        ctx.drawImage(this.image, this.x, this.y);
    }
  };
};
