function bgm_next_song() {
  var songs =
    ('5kt3atg1,2effpzfo,ij253xbt,dyvb4bhm,' +
     'ffc2levf,d3jgeh1g,trr3xkni,srm51agb,5japixlc').
    split(',');
  var pl = document.getElementById('bgm');
  pl.src = 'https://a.clyp.it/' + songs[Math.floor(rand()*9)] + '.mp3';
  pl.load(); pl.play();
}
