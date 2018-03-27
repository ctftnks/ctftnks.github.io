
function powerupMenu(){
  var content = "";
  content += "<div id='weaponMenu'>";
  content += "<h2>Powerups:</h2>";
  var sel = "selected=\"selected\"";
  for(var i=0; i<PowerUps.length; i++){
    var name = PowerUps[i].name;
    var weight = PowerUps[i].weight;
    content += "<div class='option'>";
    content += "<span class='label powerupLabel'>"+name+"</span>";
    content += "<select onchange=\"PowerUps["+i+"].weight=parseFloat(this.value)\">";
    content += "<option value=\"0\" "+(weight == 0 ? sel : "")+">0%</option>";
    content += "<option value=\"0.5\" "+(weight == 0.5 ? sel : "")+">50%</option>";
    content += "<option value=\"1\" "+(weight == 1 ? sel : "")+">100%</option>";
    content += "<option value=\"2\" "+(weight == 2 ? sel : "")+">200%</option>";
    content += "</select></div>&nbsp;";
  }
  content += "<br /><br /><div class='option'>";
  content += "<span class='label'>Rate</span>";
  content += "<select onchange=\"PowerUpFrequency=parseFloat(this.value)*1000\">";
  content += "<option value=\"2\">2s</option>";
  content += "<option value=\"4\" selected=\"selected\">4s</option>";
  content += "<option value=\"4\">6s</option>";
  content += "<option value=\"10\">10s</option>";
  content += "</select></div>&nbsp;&nbsp;&nbsp;";
  content += "<div class='option'>";
  content += "<span class='label'>Amount</span>";
  content += "<select onchange=\"MaxPowerUps=parseInt(this.value)\">";
  content += "<option value=\"2\">2</option>";
  content += "<option value=\"4\">4</option>";
  content += "<option value=\"8\" selected=\"selected\">8</option>";
  content += "<option value=\"16\">16</option>";
  content += "<option value=\"32\">32</option>";
  content += "</select></div>&nbsp;&nbsp;&nbsp;";
  content += "<button onclick=\"closeWeaponMenu();\">Close</button><br /><br /><br />";
  return content;
}

function closeWeaponMenu(){
  var elem = document.getElementById("weaponMenu");
  elem.parentNode.parentNode.removeChild(elem.parentNode);
}
