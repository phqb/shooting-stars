rand = Math.random;

var type_color = { p1 : '#FAE639', p2 : 'white' };
var type_str = { p1 : 'Yellow', p2 : 'White' };
var game = null;

function Game(ww, wh) {
  this.ww = ww;
  this.wh = wh;
  this.stage = new createjs.Stage('app');
  createjs.Touch.enable(this.stage);
  this.p1 = null;
  this.p2 = null;
  this.stars = [];
  this.go_noti = new createjs.Text('', '48px Playfair Display');
  this.go_noti.x = ww/2 - 150;
  this.go_noti.y = wh/2 - 24;
  this.go_noti.addEventListener('mousedown', this.start.bind(this));
}

Game.prototype.start = function() {
  this.stage.removeAllChildren();
  this.stage.removeAllEventListeners();
  this.p1 = new Player('p1');
  this.p2 = new Player('p2');
  this.p1.enemy = this.p2;
  this.p2.enemy = this.p1;
  this.p1.point_text.shadow.blur = 8;
  this.p1.switch_turn();
  this.p1.add(new Dot('p1', rand()*this.ww, rand()*this.wh));
  this.p2.add(new Dot('p2', rand()*this.ww, rand()*this.wh));
  for (i = 0; i < 100; ++i) {
    this.stars[i] = new createjs.Shape();
    this.stars[i].graphics
      .beginFill('white')
      .drawCircle(0, 0, rand()*2)
      .endFill();
    this.stars[i].x = rand()*this.ww;
    this.stars[i].y = rand()*this.wh;
    this.stars[i].alpha = 0;
    createjs.Tween.get(this.stars[i], { loop : true })
      .to({ alpha : rand() }, 10000, createjs.Ease.linear)
      .to({ alpha : 0 }, 10000, createjs.Ease.linear)
      .to({ x : rand()*this.ww, y : rand()*this.wh }, 100, createjs.Ease.none);
    this.stage.addChild(this.stars[i]);
  }
}

Game.prototype.over = function(type) {
  this.go_noti.text = type_str[type] + ' win!';
  this.go_noti.color = type_color[type];
  this.go_noti.shadow = new createjs.Shadow(type_color[type], 0, 0, 8);
  this.stage.addChild(this.go_noti);
}

function Player(type) {
  this.type = type;
  this.dots = [];
  this.edges = [];
  this.points = 0;
  this.point_text =
    new createjs.Text('0', '24px Playfair Display', type_color[type]);
  this.point_text.x = this.point_text.y = 10;
  if (type == 'p2') this.point_text.x = 46;
  this.point_text.shadow = new createjs.Shadow(type_color[type], 0, 0, 0);
  game.stage.addChild(this.point_text);
  this.cur = -1;
  this.enemy = null;
}

Player.prototype.select = function(event) {
  var min_dst = Math.pow(10, 2), dot;
  for (i = 0; i < this.dots.length; i++) {
    var dst = Math.pow((this.dots[i].x - event.stageX), 2) + Math.pow((this.dots[i].y - event.stageY), 2);
    if (dst < min_dst) {
      min_dst = dst;
      this.cur = i;
    }
  }
  if (this.cur >= 0) this.dots[this.cur].show_ring();
};

Player.prototype.aim = function(event) {
  if (this.cur >= 0) this.dots[this.cur].update_ring(event);
};

Player.prototype.fire = function(event) {
  if (this.cur >= 0) var p = this.dots[this.cur].hide_ring(event); else return;
  var edge = new createjs.Shape(); edge.alpha = 0;
  edge.graphics
    .setStrokeStyle(1)
    .beginStroke(type_color[this.type])
    .moveTo(this.dots[this.cur].x, this.dots[this.cur].y)
    .lineTo(p.x, p.y)
    .endStroke();
  this.edges.push(edge);
  game.stage.addChild(edge);
  createjs.Tween.get(edge, { loop : false })
    .to({ alpha : 0.75 }, 200, createjs.Ease.linear);
  if (!(p.x < 0 || p.x > game.ww || p.y < 0 || p.y > game.wh)) {
    var dot = new Dot(this.type, this.dots[this.cur].x, this.dots[this.cur].y);
    dot.begin_draw();
    dot.x = p.x; dot.y = p.y;
    this.dots.push(dot);
    createjs.Tween.get(dot.circle, { loop : false })
      .to({ x : dot.x, y : dot.y }, 200, createjs.Ease.sineOut());
  }
  var seg = new Segment(
    new Vector2(this.dots[this.cur].x, this.dots[this.cur].y),
    new Vector2(p.x, p.y)
  );
  for (i = 0; i < this.enemy.dots.length; ++i)
    if (seg.is_point_in(new Vector2(
        this.enemy.dots[i].x,
        this.enemy.dots[i].y
    ), 3)) {
      this.enemy.dots[i].circle.graphics
        .beginFill('gray')
        .drawCircle(0, 0, 6)
        .endFill();
      this.enemy.dots.splice(i, 1); i--; this.points++;
    }
  if (this.enemy.dots.length == 0) game.over(this.type);
  this.enemy.switch_turn();
  this.point_text.shadow.blur = 0;
  this.enemy.point_text.shadow.blur = 8;
  this.point_text.text = this.points.toString();

};

Player.prototype.add = function(dot) {
  this.dots.push(dot);
  this.dots[this.dots.length - 1].begin_draw();
};

Player.prototype.switch_turn = function() {
  game.stage.removeAllEventListeners('mousedown');
  game.stage.removeAllEventListeners('pressmove');
  game.stage.removeAllEventListeners('pressup');
  game.stage.addEventListener('mousedown', this.select.bind(this));
  game.stage.addEventListener('pressmove', this.aim.bind(this));
  game.stage.addEventListener('pressup', this.fire.bind(this));
};

function Dot(type, x, y) {
  this.x = x; this.y = y;
  this.ring_mradius = 48; // max scale = 2
  this.dir = null;
  this.circle = new createjs.Shape();
  this.circle.graphics
    .beginFill(type_color[type])
    .drawCircle(0, 0, 6)
    .endFill();
  this.circle.alpha = 0.75;
  this.circle.x = x;
  this.circle.y = y;
  this.circle.shadow = new createjs.Shadow('white', 0, 0, 8);
  this.ring = new createjs.Shape();
  this.ring.graphics
    .setStrokeStyle(8)
    .beginStroke(type_color[type])
    .arc(0, 0, 13, -Math.PI/8, Math.PI/8)
    .endStroke();
  this.ring.alpha = this.ring_halpha = 0;
  this.ring_salpha = 0.5;
};

Dot.prototype.update_elements_pos = function() {
  this.ring.x = this.circle.x = this.x;
  this.ring.y = this.circle.y = this.y;
};

Dot.prototype.begin_draw = function() {
  game.stage.addChild(this.circle);
  game.stage.addChild(this.ring);
  createjs.Tween.get(this.circle.shadow, { loop : true })
    .to({ blur : rand()*8 }, 4000, createjs.Ease.sineOut)
    .to({ blur : 8 }, 4000, createjs.Ease.sineOut);
};

Dot.prototype.show_ring = function(event) {
  this.update_elements_pos();
  createjs.Tween.get(this.ring, { loop : false })
    .to({ alpha : this.ring_salpha }, 100, createjs.Ease.linear);
};

Dot.prototype.update_ring = function(event) {
  this.update_elements_pos();
  this.dir =
    new Vector2(event.stageX - this.x, event.stageY - this.y);
  var r = this.dir.length();
  if (r > this.ring_mradius) {
    var k = r/this.ring_mradius;
    this.dir.k(1/k);
    r = this.dir.length();
  }
  var d = this.dir.arc(new Vector2(1, 0))*(180/Math.PI);
  if (event.stageY > this.circle.y)
    this.ring.rotation = d;
  else
    this.ring.rotation = -d;
  this.ring.scaleX = this.ring.scaleY = r/24;
};


Dot.prototype.hide_ring = function(event) {
  this.ring.alpha = this.ring_halpha;
  this.ring.scaleX = this.ring.scaleY = 1;
  return { x : this.x - this.dir.u*4, y : this.y - this.dir.v*4 };
};

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
  game = new Game(840, 480);
  game.start();
  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener('tick', game.stage);
}
