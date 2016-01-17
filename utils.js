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
  return Math.abs(this.a*p.u + this.b*p.v + this.c)
    /Math.sqrt(Math.pow(p.u, 2) + Math.pow(p.v, 2));
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

function start_game() {
  cur_turn = 'player1';

  stage.removeAllChildren();

  player1_dots[0] = new Dot('player1', rand()*ww, rand()*wh);
  player1_dots[0].begin_draw();
  player2_dots[0] = new Dot('player2', rand()*ww, rand()*wh);
  player2_dots[0].begin_draw();

  for (i = 0; i < 100; ++i) {
    var star = new createjs.Shape();
    star.graphics
      .beginFill('white')
      .drawCircle(0, 0, rand()*2)
      .endFill();
    star.x = rand()*ww;
    star.y = rand()*wh;
    star.alpha = 0;
    createjs.Tween.get(star, { loop : true })
      .to({ alpha : rand() }, 10000, createjs.Ease.linear)
      .to({ alpha : 0 }, 10000, createjs.Ease.linear)
      .to({ x : rand()*ww, y : rand()*wh }, 100, createjs.Ease.none);
    stage.addChild(star);
  }
}

function show_notification(msg) {
  var text = new createjs.Text(msg, '48px Playfair Display', 'white');
  text.x = ww/2; text.y = wh/2 - 24; text.textAlign = 'center';
  text.addEventListener('click', start_game);
  stage.addChild(text);
}

function take_a_screenshot() {
  var canvas = document.getElementById('app');
  var img = canvas.toDataURL("image/jpeg", 1.0);
  window.open(img, '');
}

// Src: http://stackoverflow.com/questions/16124569/how-can-i-make-the-html5-canvas-go-fullscreen
function goFullScreen(){
    var canvas = document.getElementById('app');
    document.getElementById('app').style.background = "rgb(4, 13, 84)";
    if(canvas.requestFullScreen)
      canvas.requestFullScreen();
    else if(canvas.webkitRequestFullScreen)
      canvas.webkitRequestFullScreen();
    else if(canvas.mozRequestFullScreen)
      canvas.mozRequestFullScreen();
}
