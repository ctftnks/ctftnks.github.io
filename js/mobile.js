function checkMobile(){
  var forceMobile = false;
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || forceMobile ) {
    IsMobile = true;
    enableMobile();
  }
}



enableMobile = function(){
  console.log("mobile controls activated!");
  document.getElementById("mobileControls").style.display = "block";
}
