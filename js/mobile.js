function checkMobile() {
  var forceMobile = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || forceMobile) {
    IsMobile = true;
    enableMobile();
  }
}

mobileControlsIntvl = 0;

enableMobile = function () {
  console.log("mobile controls activated!");
  document.getElementById("mobileControls").style.display = "block";

  if (MobileJoystick) {
    // include joystick script
    var script = document.createElement("script");
    script.src = "js/joystick.js";
    script.onload = function () {
      var joystick = new VirtualJoystick({
        container: document.getElementById("joystickContainer"),
        mouseSupport: true,
      });

      mobileControlsIntvl = setInterval(function () {
        if (typeof game == "undefined") return;

        var t = game.players[0].tank;
        var jx = joystick.deltaX();
        var jy = joystick.deltaY();
        var angle = Math.atan2(jy, jx) + Math.PI / 2;
        if (jx != 0 && jy != 0) t.angle = angle;

        if (jx * jx + jy * jy > 5) Key._pressed[Key.UP] = true;
        else Key._pressed[Key.UP] = false;
      }, GameFrequency);

      document.getElementById("mobileFire").classList.add("joystick");
      document.getElementById("mobileLeft").classList.add("joystick");
      document.getElementById("mobileRight").classList.add("joystick");
      document.getElementById("mobileUp").classList.add("joystick");
      document.getElementById("mobileBack").classList.add("joystick");
    };
    document.head.appendChild(script);
  } else {
    document.getElementById("mobileFire").classList.remove("joystick");
    document.getElementById("mobileLeft").classList.remove("joystick");
    document.getElementById("mobileRight").classList.remove("joystick");
    document.getElementById("mobileUp").classList.remove("joystick");
    document.getElementById("mobileBack").classList.remove("joystick");
  }

  document.getElementById("mobileFire").ontouchstart = function () {
    Key._pressed[Key.SPACE] = true;
  };
  document.getElementById("mobileFire").ontouchend = function () {
    Key._pressed[Key.SPACE] = false;
  };
  document.getElementById("mobileBack").ontouchstart = function () {
    Key._pressed[Key.DOWN] = true;
  };
  document.getElementById("mobileBack").ontouchend = function () {
    Key._pressed[Key.DOWN] = false;
  };
  document.getElementById("mobileLeft").ontouchstart = function () {
    Key._pressed[Key.LEFT] = true;
  };
  document.getElementById("mobileLeft").ontouchend = function () {
    Key._pressed[Key.LEFT] = false;
  };
  document.getElementById("mobileRight").ontouchstart = function () {
    Key._pressed[Key.RIGHT] = true;
  };
  document.getElementById("mobileRight").ontouchend = function () {
    Key._pressed[Key.RIGHT] = false;
  };
  document.getElementById("mobileUp").ontouchstart = function () {
    Key._pressed[Key.UP] = true;
  };
  document.getElementById("mobileUp").ontouchend = function () {
    Key._pressed[Key.UP] = false;
  };
};
