function bgm_next_song() {
  var songs =
    ('5kt3atg1,2effpzfo,ij253xbt,dyvb4bhm,' +
     'ffc2levf,d3jgeh1g,trr3xkni,srm51agb,5japixlc').
    split(',');
  document.getElementById('bgm').src =
    'https://a.clyp.it/' + songs[Math.floor(rand()*9)] + '.mp3';
}
