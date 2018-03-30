function checkMobile(){
  var forceMobile = false;
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || forceMobile ) {
    IsMobile = true;
    enableMobile();
  }
}


mobileControlsIntvl = 0;

enableMobile = function(){

  console.log("mobile controls activated!");



  // include joystick script
  var script = document.createElement("script");
  script.src = "js/joystick.js";
  script.onload = function(){

    document.getElementById("mobileControls").style.display = "block";
    var joystick	= new VirtualJoystick({
      container	: document.getElementById('joystickContainer'),
      mouseSupport	: true,
    });

    mobileControlsIntvl = setInterval(function(){

      if(typeof(game) == "undefined")
        return;


        var t = game.players[0].tank;
      var jx = joystick.deltaX();
      var jy = joystick.deltaY();
      var angle = Math.atan2(jy, jx) + Math.PI / 2;
      if(jx != 0 && jy != 0)
        t.angle = angle;

      if(jx*jx+jy*jy > 5)
        Key._pressed[Key.UP] = true;
      else
        Key._pressed[Key.UP] = false;

    }, GameFrequency);

  };
  document.head.appendChild(script);


  document.getElementById("mobileFire").ontouchstart = function(){
    Key._pressed[Key.SPACE] = true;
  }
  document.getElementById("mobileFire").ontouchend = function(){
    Key._pressed[Key.SPACE] = false;
  }
  document.getElementById("mobileBack").ontouchstart = function(){
    Key._pressed[Key.DOWN] = true;
  }
  document.getElementById("mobileBack").ontouchend = function(){
    Key._pressed[Key.DOWN] = false;
  }

}
