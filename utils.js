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

Vector2.prototype.arc = function(vector) {
  return Math.acos(this.dotProduct(vector)/(this.length()*vector.length()));
};

Vector2.prototype.k = function(k) {
  this.u *= k;
  this.v *= k;
};

function Segment(u, v) {
  this.u = u;
  this.v = v;
  this.a = u.v - v.v;
  this.b = v.u - u.u;
  this.c = u.u*v.v - v.u*u.v;
}

Segment.prototype.dist_to = function(p) {
  return Math.abs(this.a*p.u + this.b*p.v + this.c)/
    Math.sqrt(Math.pow(this.a, 2) + Math.pow(this.b, 2));
};

Segment.prototype.is_point_in = function(p, delta) {
  return (
    this.dist_to(p) <= delta &&
    Math.min(this.u.u, this.v.u) <= p.u &&
    p.u <= Math.max(this.u.u, this.v.u) &&
    Math.min(this.u.v, this.v.v) <= p.v &&
    p.v <= Math.max(this.u.v, this.v.v)
  );
};

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
