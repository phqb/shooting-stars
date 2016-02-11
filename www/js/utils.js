function Vector2(u, v) {
  this.u = u;
  this.v = v;
}

Vector2.prototype.dotProduct = function(vector) {
  return this.u*vector.u + this.v*vector.v;
};

Vector2.prototype.length = function() {
  return Math.sqrt(this.u*this.u + this.v*this.v);
};

Vector2.prototype.dist = function(p) {
  return Math.sqrt(Math.pow(p.u - this.u, 2) + Math.pow(p.v - this.v, 2));
};

Vector2.prototype.arc = function(vector) {
  return Math.acos(this.dotProduct(vector)/(this.length()*vector.length()));
};

Vector2.prototype.k = function(k) {
  this.u *= k;
  this.v *= k;
};

function Line(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

Line.prototype.intersect = function(l) {
  var det = this.a*l.b - this.b*l.a;
  if (det != 0)
    return new Vector2(
      (-this.c*l.b + this.b*l.c)/det,
      (-this.a*l.c + this.c*l.a)/det
    );
  else
    return undefined;
};

function Segment(u, v) {
  this.u = u;
  this.v = v;
  this.l = new Line(u.v - v.v, v.u - u.u, u.u*v.v - v.u*u.v);
}

Segment.prototype.dist_to = function(p) {
  return Math.abs(this.l.a*p.u + this.l.b*p.v + this.l.c)/
    Math.sqrt(Math.pow(this.l.a, 2) + Math.pow(this.l.b, 2));
};

Segment.prototype.is_point_in = function(p, delta) {
  var n = new Vector2(this.v.u - this.u.u, this.v.v - this.u.v);
  var i = this.l.intersect(new Line(n.u, n.v, -n.u*p.u - n.v*p.v));
  if (
    (i.v >= this.u.v && i.v <= this.v.v) ||
    (i.v >= this.v.v && i.v <= this.u.v)
  )
    return (this.dist_to(p) <= delta);
  else
    return (this.u.dist(p) <= delta || this.v.dist(p) <= delta);
};

// BEGIN Code snippet
//http://stackoverflow.com/questions/19689715/
//what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
function isRetina(){
  return (
    (window.matchMedia &&
      (window.matchMedia(
        'only screen and (min-resolution: 192dpi), ' +
        'only screen and (min-resolution: 2dppx), ' +
        'only screen and (min-resolution: 75.6dpcm)'
      ).matches ||
      window.matchMedia(
        'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
        'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
        'only screen and (min--moz-device-pixel-ratio: 2), ' +
        'only screen and (min-device-pixel-ratio: 2)'
      ).matches)
    ) ||
    (window.devicePixelRatio &&
      window.devicePixelRatio >= 2)) &&
      /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

function isHighDensity(){
  return (
    (window.matchMedia &&
      (window.matchMedia(
        'only screen and (min-resolution: 124dpi), ' +
        'only screen and (min-resolution: 1.3dppx), ' +
        'only screen and (min-resolution: 48.8dpcm)'
      ).matches ||
      window.matchMedia(
        'only screen and (-webkit-min-device-pixel-ratio: 1.3), ' +
        'only screen and (-o-min-device-pixel-ratio: 2.6/2), ' +
        'only screen and (min--moz-device-pixel-ratio: 1.3), ' +
        'only screen and (min-device-pixel-ratio: 1.3)'
      ).matches)
    ) ||
    (window.devicePixelRatio &&
      window.devicePixelRatio > 1.3));
}
// END Code snippet
