// A trajectory through the map
// with useful functions to draw or so for lasers

Trajectory = function (map) {
  Object.call(this);

  this.hidden = false;
  this.color = "#000";
  this.thickness = 2;
  this.length = 2000;
  this.x = undefined;
  this.y = undefined;
  this.angle = undefined;
  this.delta = 4;
  this.points = [];
  this.map = map;
  this.drawevery = 1;
  this.timeout = 100;
  this.targets = [];

  this.draw = function (canvas, context) {
    if (this.hidden) return;
    for (var i = 0; i < this.points.length; i += this.drawevery) {
      var p = this.points[i];
      // TODO less save & restore
      context.save();
      context.beginPath();
      context.translate(p.x, p.y);
      context.rotate(p.angle);
      context.rect(-this.thickness / 2, -this.delta / 2, this.thickness, this.delta);
      context.fillStyle = this.color;
      context.fill();
      context.restore();
    }
  };

  this.step = function () {
    // update points list
    this.targets = [];
    var point = { x: this.x, y: this.y, angle: this.angle };
    var length = 0;
    this.points = [point];
    while (length < this.length) {
      point = this.points[this.points.length - 1];
      var nextpoint = {
        x: point.x - this.delta * Math.sin(-point.angle),
        y: point.y - this.delta * Math.cos(-point.angle),
        angle: point.angle,
      };
      var tile = this.map.getTileByPos(point.x, point.y);
      if (tile == -1) return;
      var walls = tile.getWalls(nextpoint.x, nextpoint.y);
      var nwalls = walls.filter((w) => w).length;
      // if there seems to be a wall: handle accordingly
      if (nwalls == 2) {
        nextpoint.angle += Math.PI;
        nextpoint.x = point.x;
        nextpoint.y = point.y;
      } else if (walls[1] || walls[3]) {
        // left or right
        nextpoint.angle *= -1;
        nextpoint.x = 2 * point.x - nextpoint.x;
      } else if (walls[0] || walls[2]) {
        // top or bottom
        nextpoint.angle = Math.PI - nextpoint.angle;
        nextpoint.y = 2 * point.y - nextpoint.y;
      }
      length += this.delta;
      this.points.push(nextpoint);
      // see if any tanks targeted
      for (var i = 0; i < tile.objs.length; i++) if (tile.objs[i].type == "Tank") this.targets.push(tile.objs[i]);
    }

    this.timeout -= GameFrequency;
    if (this.timeout < 0) this.delete();
  };
};
