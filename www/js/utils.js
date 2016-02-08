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

function bgm_next_song() {
  var songs = (
    'Kagaya-01.Night_on_the_Galactic_Railroad,' +
    'Kagaya-02.classes,' +
    'Kagaya-03.House,' +
    'Kagaya-08.Stars_are_triangular_emblem_to_the_north,' +
    'Kagaya-12.Smell,' +
    'Kagaya-14.New_World,' +
    'Kagaya-15.Fire,' +
    'Kagaya-18.Large_bag_of_coal,' +
    'Kagaya-22.One_night_Instrumental_Ver'
  ).split(',');
  var src = 'bgm/' + songs[Math.floor(rand()*songs.length)] + '.mp3';
  var pl = document.getElementById('bgm');
  pl.src = src;
}
