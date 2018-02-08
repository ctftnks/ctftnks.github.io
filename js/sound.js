


function playSound(file){
  if(file != "" && !muted){
    var audio = new Audio(file);
    audio.play();
  }
}
