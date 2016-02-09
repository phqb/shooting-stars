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
}

var last_show_menu_time = -1;

function show_menu() {
  document.getElementById('menu').style.display = "block";
  last_show_menu_time = new Date().getTime();
}

function hide_menu() {
  document.getElementById('menu').style.display = "none";
  last_show_menu_time = -1;
}

var screenshot_count = 0;

function take_a_screenshot() {
  document.getElementById('screenshot-img').download =
    "screenshot_" + screenshot_count + '.png';
  document.getElementById('screenshot-img').href =
    document.getElementById('game').toDataURL();
  ++screenshot_count;
}

function show_game() {
  document.getElementById('welcome').style.display = 'none';
  window.scrollY = 0;
  document.onclick = show_menu;
}

setInterval(function() {
  t = new Date().getTime();
  if (t - last_show_menu_time >= 2000) hide_menu();
}, 1000);