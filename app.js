rand = Math.random;

var ww = 840, wh = 480;
var stage = null;

var cur_turn;

var player1_dots = [], player2_dots = [];

var type_color = {
  player1 : '#FAE639',
  player2 : 'white'
};

var type_str = {
  player1 : 'Yellow',
  player2 : 'White'
};

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
    if (this.type == 'player1') player1_dots.push(new_dot); else player2_dots.push(new_dot);

    createjs.Tween.get(new_dot.circle, { loop : false })
      .to({ x : new_x, y : new_y }, 200, createjs.Ease.sineOut());
  }

  var ene; if (this.type == 'player1') ene = player2_dots; else ene = player1_dots;

  var seg = new Segment(
    new Vector2(this.circle.x, this.circle.y),
    new Vector2(new_x, new_y)
  );

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
      ene.splice(i, 1); i--;
    }

  if (player1_dots.length == 0)
    show_notification(type_str['player2'] + ' win!');
  else if (player2_dots.length == 0)
    show_notification(type_str['player1'] + ' win!');

  if (cur_turn == 'player1') cur_turn = 'player2'; else cur_turn = 'player1';
};

function app() {
  stage = new createjs.Stage('app');

  start_game();

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener('tick', stage);
}
