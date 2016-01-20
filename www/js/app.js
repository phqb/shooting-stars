rand = Math.random;

var type_color = { p1 : '#FAE639', p2 : 'white' };
var type_str = { p1 : 'Yellow', p2 : 'White' };

var ww = 840, wh = 480;
var stage, cur_turn;

var p1_dots = [], p2_dots = [];
var p1_point, p2_point;
var p1_point_text, p2_point_text;

function Dot(type, x, y) {
  this.type = type;
  this.ring_mradius = 48; // max scale = 2
  this.cur_dir = null;
  this.died = false;

  this.circle = new createjs.Shape();
  this.circle.graphics
    .beginFill(type_color[type])
    .drawCircle(0, 0, 6)
    .endFill();
  this.circle.alpha = 0.75;
  this.circle.x = x;
  this.circle.y = y;
  this.circle.shadow = new createjs.Shadow('white', 0, 0, 8);

  this.circle.addEventListener('mousedown', this.show_ring.bind(this));
  this.circle.addEventListener('pressmove', this.update_ring.bind(this));
  this.circle.addEventListener('pressup', this.hide_ring.bind(this));

  this.ring = new createjs.Shape();
  this.ring.graphics
    .setStrokeStyle(8)
    .beginStroke(type_color[type])
    .arc(0, 0, 13, -Math.PI/8, Math.PI/8)
    .endStroke();
  this.ring.alpha = this.ring_halpha = 0;
  this.ring_salpha = 0.5;

  this.edge = new createjs.Shape();
  this.edge.alpha = 0;
};

Dot.prototype.update_elements_pos = function() {
  this.ring.x = this.circle.x;
  this.ring.y = this.circle.y;
};

Dot.prototype.begin_draw = function() {
  stage.addChild(this.circle);
  stage.addChild(this.ring);
  createjs.Tween.get(this.circle.shadow, { loop : true })
    .to({ blur : rand()*8 }, 4000, createjs.Ease.sineOut)
    .to({ blur : 8 }, 4000, createjs.Ease.sineOut);
};

Dot.prototype.show_ring = function(event) {
  if (this.type != cur_turn || this.died) return;

  this.update_elements_pos();
  createjs.Tween.get(this.ring, { loop : false })
    .to({ alpha : this.ring_salpha }, 100, createjs.Ease.linear);
};

Dot.prototype.update_ring = function(event) {
  if (this.type != cur_turn || this.died) return;

  this.update_elements_pos();
  this.cur_dir =
    new Vector2(event.stageX - this.circle.x, event.stageY - this.circle.y);
  var r = this.cur_dir.length();
  if (r > this.ring_mradius) {
    var k = r/this.ring_mradius;
    this.cur_dir.k(1/k);
    r = this.cur_dir.length();
  }
  var d = this.cur_dir.arc(new Vector2(1, 0))*(180/Math.PI);
  if (event.stageY > this.circle.y)
    this.ring.rotation = d;
  else
    this.ring.rotation = -d;
  this.ring.scaleX = this.ring.scaleY = r/24;
};


Dot.prototype.hide_ring = function(event) {
  if (this.type != cur_turn || this.died) return;

  this.ring.alpha = this.ring_halpha;
  this.ring.scaleX = this.ring.scaleY = 1;

  var new_x = this.circle.x - this.cur_dir.u*4;
  var new_y = this.circle.y - this.cur_dir.v*4;
  this.edge.graphics
    .setStrokeStyle(1)
    .beginStroke(type_color[this.type])
    .moveTo(new_x, new_y)
    .lineTo(this.circle.x, this.circle.y)
    .endStroke();
  stage.addChild(this.edge);
  createjs.Tween.get(this.edge, { loop : false})
    .to({ alpha : 0.75 }, 200, createjs.Ease.linear);
  if (!(new_x < 0 || new_x > ww || new_y < 0 || new_y > wh)) {
    var new_dot = new Dot(this.type, this.circle.x, this.circle.y);
    new_dot.begin_draw();
    if (this.type == 'p1')
      p1_dots.push(new_dot);
    else
      p2_dots.push(new_dot);

    createjs.Tween.get(new_dot.circle, { loop : false })
      .to({ x : new_x, y : new_y }, 200, createjs.Ease.sineOut());
  }

  var ene;
  if (this.type == 'p1')
    ene = p2_dots;
  else
    ene = p1_dots;

  var seg = new Segment(
    new Vector2(this.circle.x, this.circle.y),
    new Vector2(new_x, new_y)
  );

  var dpoint = 0;
  for (i = 0; i < ene.length; ++i)
    if (
      !ene[i].died &&
      seg.is_point_in(new Vector2(ene[i].circle.x, ene[i].circle.y), 3)
    ) {
      ene[i].died = true;
      ene[i].circle.graphics
        .beginFill('gray')
        .drawCircle(0, 0, 6)
        .endFill();
      ene.splice(i, 1); i--; dpoint++;
    }

  if (p1_dots.length == 0)
    game_over('p2');
  else if (p2_dots.length == 0)
    game_over('p1');

  if (cur_turn == 'p1') {
    p1_point += dpoint;
    cur_turn = 'p2';
    p1_point_text.shadow.blur = 0;
    p2_point_text.shadow.blur = 8;
  } else {
    p2_point += dpoint;
    cur_turn = 'p1';
    p1_point_text.shadow.blur = 8;
    p2_point_text.shadow.blur = 0;
  }

  p1_point_text.text = p1_point.toString();
  p2_point_text.text = p2_point.toString();
};

function start_game() {
  stage.removeAllChildren();

  p1_point = p2_point = 0;
  p1_point_text =
    new createjs.Text('0', '24px Playfair Display', type_color['p1']);
  p2_point_text =
    new createjs.Text('0', '24px Playfair Display', type_color['p2']);
  p1_point_text.y = p2_point_text.y = 10;
  p1_point_text.x = 10; p2_point_text.x = 64;
  p1_point_text.shadow =
    p2_point_text.shadow || new createjs.Shadow(type_color['p1'], 0, 0, 8);
  p2_point_text.shadow =
    p2_point_text.shadow || new createjs.Shadow(type_color['p2'], 0, 0, 0);
  stage.addChild(p1_point_text);
  stage.addChild(p2_point_text);

  cur_turn = 'p1';

  p1_dots[0] = new Dot('p1', rand()*ww, rand()*wh);
  p1_dots[0].begin_draw();
  p2_dots[0] = new Dot('p2', rand()*ww, rand()*wh);
  p2_dots[0].begin_draw();

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

function game_over(type) {
  var text = new createjs.Text(
    type_str[type] + ' win!', '48px Playfair Display', type_color[type]);
  text.x = ww/2; text.y = wh/2 - 24; text.textAlign = 'center';
  text.shadow = new createjs.Shadow(type_color[type], 0, 0, 8);
  text.addEventListener('click', start_game);
  stage.addChild(text);
}

function take_a_screenshot() {
  var canvas = document.getElementById('app');
  var img = canvas.toDataURL("image/png", 1.0);
  window.open(img, '');
}

// Src: http://stackoverflow.com/questions/16124569/how-can-i-make-the-html5-canvas-go-fullscreen
function goFullScreen(){
  var canvas = document.getElementById('app');
  if(canvas.requestFullScreen)
    canvas.requestFullScreen();
  else if(canvas.webkitRequestFullScreen)
    canvas.webkitRequestFullScreen();
  else if(canvas.mozRequestFullScreen)
    canvas.mozRequestFullScreen();
}

function app() {
  stage = new createjs.Stage('app');
  createjs.Touch.enable(stage);

  start_game();

  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener('tick', stage);
}
