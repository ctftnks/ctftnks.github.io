


function playSound(file){
  if(file != "" && !muted){
    var audio = new Audio(file);
    audio.play();
  }
}


effectCanvasID = 0;
function newEffectCanvas(){
  var canv = document.createElement("canvas");
  effectCanvasID++;
  id = "effectCanvas" + effectCanvasID;
  canv.id = id;
  canv.setAttribute("class", "effectCanvas");
  document.body.appendChild(canv);
  return canv;
}



function fogOfWar(game){
  var canv = document.getElementById("effectFrame");
  canv.height = game.canvas.canvas.clientHeight;
  canv.width = game.canvas.canvas.clientWidth;

  var duration = 10000;
  var frequency = 30;
  var time = 0;
  var ctx = canv.getContext("2d");
  var height = this.canvas.clientHeight;
  var width = this.canvas.clientWidth;

  var ctx = canv.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(game.canvas.scale, game.canvas.scale);
  var ambientLight = 1;
  var intensity = 1;
  var intvl = setInterval(function(){
    ctx.clearRect(0, 0, 2*canv.width, 2*canv.height);
    if(time < 300)
      ambientLight -= frequency / 300;
    if(duration - time < 300)
      ambientLight += frequency / 300;
    ctx.fillStyle = 'rgba(0,0,0,' + (1 - ambientLight) + ')';
    ctx.fillRect(0, 0, game.map.Nx*game.map.dx, game.map.Ny*game.map.dy);
    for(var i=0; i<game.players.length; i++){
      var x = game.players[i].tank.x;
      var y = game.players[i].tank.y;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, Math.PI*2, true);
      ctx.clip();
      ctx.clearRect(x - 100, y - 100, 200, 200);
      ctx.closePath();
      ctx.restore();
    }
    time += frequency;
  }, frequency);

  game.intvls.push(intvl);
  setTimeout(function(){
    clearInterval(intvl);
    ctx.clearRect(0, 0, 2*canv.width, 2*canv.height);
  }, duration);
  return intvl;
}
