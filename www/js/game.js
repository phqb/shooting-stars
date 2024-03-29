rand = Math.random;

var type_color = { p1 : '#FAE639', p2 : 'white' };
var type_str = { p1 : 'Yellow', p2 : 'White' };
var kills_str = { 2 : 'Double', 3 : 'Triple', 4 : 'Quadra', 5 : 'Penta' };
var factor = 1;

function Game(ww, wh, id) {
  var old = document.getElementById(id);
  var ctx = old.getContext('2d');
  ctx.clearRect(0, 0, old.width, old.height);
  this.ww = ww;
  this.wh = wh;
  this.stage = new createjs.Stage(id);
  this.stage.mouseMoveOutside = true;
  createjs.Touch.enable(this.stage, true, true);
  this.bg = new createjs.Shape();
  this.bg.graphics.beginFill('rgb(4, 13, 84)').drawRect(0, 0, ww, wh).endFill();
  this.p1 = null;
  this.p2 = null;
  this.stars = [];
  this.notification = new createjs.Text('', 48*factor + 'px Playfair Display');
  this.notification.x = ww/2;
  this.notification.y = wh/2 - 24*factor;
  this.notification.scaleX = this.notification.scaleY = 0;
  this.notification.textAlign = 'center';
  this.notification.shadow = new createjs.Shadow('white', 0, 0, 8*factor);
}

Game.prototype.start = function() {
  this.stage.removeAllChildren();
  this.stage.removeAllEventListeners();
  this.stage.addChild(this.bg);
  this.p1 = new Player('p1', this);
  this.p2 = new Player('p2', this);
  this.p1.enemy = this.p2;
  this.p2.enemy = this.p1;
  this.p1.point_text.shadow.blur = 8*factor;
  this.p1.switch_turn();
  this.p1.add(new Dot('p1', 8*factor + rand()*(this.ww - 16*factor),
    8*factor + rand()*(this.wh - 16*factor)));
  this.p2.add(new Dot('p2', 8*factor + rand()*(this.ww - 16*factor),
    8*factor + rand()*(this.wh - 16*factor)));
  for (i = 0; i < 100; ++i) {
    this.stars[i] = new createjs.Shape();
    this.stars[i].graphics
      .beginFill('white')
      .drawCircle(0, 0, rand()*2*factor)
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
};

Game.prototype.show_notification = function(str, color, out, evt) {
  if (out === undefined) out = false;
  if (evt === undefined) evt = {};
  this.notification.text = str;
  this.notification.color = this.notification.shadow.color = color;
  if (out) {
    createjs.Tween.get(this.notification, { loop : false })
      .to({ scaleX : 1, scaleY : 1 }, 100, createjs.Ease.linear)
      .to({ scaleX : 1, scaleY : 1 }, 100, createjs.Ease.linear)
      .to({ scaleX : 0, scaleY : 0 }, 100, createjs.Ease.linear);
  } else {
    createjs.Tween.get(this.notification, { loop : false })
      .to({ scaleX : 1, scaleY : 1 }, 100, createjs.Ease.linear);
    this.notification.removeAllEventListeners();
    this.notification.addEventListener(evt.on, evt.event);
  }
  this.stage.addChild(this.notification);
  this.notification.scaleX = this.notification.scaleY = 0;
}

function Player(type, game) {
  this.type = type;
  this.game = game;
  this.dots = [];
  this.edges = [];
  this.points = 0;
  this.point_text =
    new createjs.Text('0', 24*factor + 'px Playfair Display', type_color[type]);
  this.point_text.x = this.point_text.y = 10*factor;
  if (type == 'p2') this.point_text.x = 46*factor;
  this.point_text.shadow = new createjs.Shadow(type_color[type], 0, 0, 0);
  this.game.stage.addChild(this.point_text);
  this.cur = this.master = -1;
  this.enemy = null;
}

Player.prototype.select = function(event) {
  this.cur = -1;
  var min_dst = Math.pow(24*factor, 2);
  for (i = 0; i < this.dots.length; i++) {
    var dst =
      Math.pow((this.dots[i].x - event.stageX), 2) +
      Math.pow((this.dots[i].y - event.stageY), 2);
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
    .setStrokeStyle(1*factor)
    .beginStroke(type_color[this.type])
    .moveTo(this.dots[this.cur].x, this.dots[this.cur].y)
    .lineTo(p.x, p.y)
    .endStroke();
  this.edges.push(edge);
  this.game.stage.addChild(edge);
  createjs.Tween.get(edge, { loop : false })
    .to({ alpha : 0.75 }, 200, createjs.Ease.linear);
  if (!(p.x < 0 || p.x > this.game.ww || p.y < 0 || p.y > this.game.wh)) {
    var dot = new Dot(this.type, this.dots[this.cur].x, this.dots[this.cur].y);
    dot.x = p.x; dot.y = p.y;
    this.add(dot);
    createjs.Tween.get(dot.circle, { loop : false })
      .to({ x : dot.x, y : dot.y }, 200, createjs.Ease.sineOut());
  }
  var seg = new Segment(
    new Vector2(this.dots[this.cur].x, this.dots[this.cur].y),
    new Vector2(p.x, p.y)
  );
  var kills = 0, master_killed = false;
  for (i = 0; i < this.enemy.dots.length; ++i)
    if (seg.is_point_in(new Vector2(
        this.enemy.dots[i].x,
        this.enemy.dots[i].y
    ), this.enemy.dots[i].r)) {
      if (i == this.enemy.master) master_killed = true;
      this.enemy.dots[i].circle.graphics
        .beginFill('gray')
        .drawCircle(0, 0, this.enemy.dots[i].r)
        .endFill();
      this.enemy.dots.splice(i, 1); i--; this.points++; kills++;
    }
  if (this.enemy.dots.length == 0 || master_killed)
    this.game.show_notification(
      type_str[this.type] + ' win!',
      type_color[this.type],
      false,
      { event : game, on : 'mousedown' }
    );
  else if (kills > 1)
    this.game.show_notification(
      (kills <= 5 ? kills_str[kills] : 'Crazy') + ' kill!',
      type_color[this.type],
      true
    );
  this.enemy.switch_turn();
  this.point_text.shadow.blur = 0;
  this.enemy.point_text.shadow.blur = 8*factor;
  this.point_text.text = this.points.toString();
};

Player.prototype.add = function(dot) {
  this.dots.push(dot);
  this.dots[this.dots.length - 1].begin_draw(this.game.stage);
  if (dot.r > (this.master >= 0?this.dots[this.master].r:Number.MIN_VALUE))
    this.master = this.dots.length - 1;
};

Player.prototype.switch_turn = function() {
  this.game.stage.removeAllEventListeners('stagemousedown');
  this.game.stage.removeAllEventListeners('stagemousemove');
  this.game.stage.removeAllEventListeners('stagemouseup');
  this.game.stage.addEventListener('stagemousedown', this.select.bind(this));
  this.game.stage.addEventListener('stagemousemove', this.aim.bind(this));
  this.game.stage.addEventListener('stagemouseup', this.fire.bind(this));
};

function Dot(type, x, y) {
  this.r = rand()*4*factor + 4*factor;
  this.x = x; this.y = y;
  this.ring_mradius = 48*factor; // max scale = 2
  this.dir = null;
  this.circle = new createjs.Shape();
  this.circle.graphics
    .beginFill(type_color[type])
    .drawCircle(0, 0, this.r)
    .endFill();
  this.circle.alpha = 0.75;
  this.circle.x = x;
  this.circle.y = y;
  this.circle.shadow = new createjs.Shadow('white', 0, 0, 8*factor);
  this.ring = new createjs.Shape();
  this.ring.graphics
    .setStrokeStyle(8*factor)
    .beginStroke(type_color[type])
    .arc(0, 0, 13*factor, -Math.PI/8, Math.PI/8)
    .endStroke();
  this.ring.alpha = this.ring_halpha = 0;
  this.ring_salpha = 0.5;
};

Dot.prototype.update_elements_pos = function() {
  this.ring.x = this.circle.x = this.x;
  this.ring.y = this.circle.y = this.y;
};

Dot.prototype.begin_draw = function(stage) {
  stage.addChild(this.circle);
  stage.addChild(this.ring);
  createjs.Tween.get(this.circle.shadow, { loop : true })
    .to({ blur : rand()*8*factor }, 4000, createjs.Ease.linear)
    .to({ blur : 8*factor }, 4000, createjs.Ease.linear);
};

Dot.prototype.show_ring = function(event) {
  this.update_elements_pos();
  createjs.Tween.get(this.ring, { loop : false })
    .to({ alpha : this.ring_salpha }, 100, createjs.Ease.linear);
};

Dot.prototype.update_ring = function(event) {
  this.update_elements_pos();
  this.dir = new Vector2(event.rawX - this.x, event.rawY - this.y);
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
  this.ring.scaleX = this.ring.scaleY = r/(24*factor);
};


Dot.prototype.hide_ring = function(event) {
  this.ring.alpha = this.ring_halpha;
  this.ring.scaleX = this.ring.scaleY = 1;
  return { x : this.x - this.dir.u*4, y : this.y - this.dir.v*4 };
};

function resize() {
  var cv = document.getElementById('game');
  if (window.innerWidth/window.innerHeight > cv.offsetWidth/cv.offsetHeight) {
    cv.style.width = "auto";
    cv.style.height = window.innerHeight + 'px';
  } else {
    cv.style.width = window.innerWidth + 'px';
    cv.style.height = "auto";
  }
  cv.style.marginTop = window.innerHeight/2 - cv.offsetHeight/2 + 'px';
  document.getElementById('menu').style.top = window.innerHeight - 47 + 'px';
}

var last_show_menu_time = -1;

function show_menu() {
  document.getElementById('menu').style.display = "block";
  last_show_menu_time = createjs.Ticker.getTime();
}

function hide_menu() {
  document.getElementById('menu').style.display = "none";
  last_show_menu_time = -1;
}

function hide_screenshot() {
  document.getElementById('screenshot').style.display = "none";
}

function show_game() {
  document.getElementById('welcome').style.display = 'none';
  window.scrollY = 0;
  document.onclick = show_menu;
  game();
}

function bgm_next_song() {
  var songs =
    ('5kt3atg1,2effpzfo,ij253xbt,dyvb4bhm,' +
     'ffc2levf,d3jgeh1g,trr3xkni,srm51agb,5japixlc').
    split(',');
  document.getElementById('bgm').src =
    'https://a.clyp.it/' + songs[Math.floor(rand()*9)] + '.mp3';
}

function game() {
  var w = window.innerWidth, h = window.innerHeight;
  if (w < h) { var tmp = w; w = h; h = tmp; }
  var cv = document.getElementById('game');
  if (isRetina() || isHighDensity()) { factor = 2; w *= factor; h *= factor; }
  cv.setAttribute('width', w + 'px');
  cv.setAttribute('height', h + 'px');
  new_game = new Game(w, h, 'game');
  new_game.start();
  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener('tick', new_game.stage);
  createjs.Ticker.addEventListener('tick', function() {
    if (createjs.Ticker.getTime() - last_show_menu_time >= 2000) hide_menu();
  });
  resize();
  bgm_next_song();
}
