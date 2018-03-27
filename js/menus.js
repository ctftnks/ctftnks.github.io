

// create screen div in container, load content into screen
screenID = 0;
function openScreen(func){
  var scr = "";
  scr += "<div class='screen' id='screen"+screenID+"'>";
  scr += "<div class='closeframe' onclick='closeScreen("+screenID+")'></div>";
  scr += "</div>";
  document.getElementById("screenContainer").innerHTML += scr;
  document.getElementById("screen"+screenID).innerHTML += func();
  return screenID++;
}

// close a screen by ID
function closeScreen(id){
  var elem = document.getElementById("screen"+id);
  elem.parentNode.removeChild(elem);
}
