

function updatePowerupsMenu() {
  var sel = "selected=\"selected\"";
  var content = "";
  for (var i = 0; i < PowerUps.length; i++) {
    var name = PowerUps[i].name;
    var weight = PowerUps[i].weight;
    content += "<div class='option'>";
    content += "<span class='label powerupLabel'>" + name + "</span>";
    content += "<select onchange=\"PowerUps[" + i + "].weight=parseFloat(this.value)\">";
    content += "<option value=\"0\" " + (weight == 0 ? sel : "") + ">0%</option>";
    content += "<option value=\"0.5\" " + (weight == 0.5 ? sel : "") + ">50%</option>";
    content += "<option value=\"1\" " + (weight == 1 ? sel : "") + ">100%</option>";
    content += "<option value=\"2\" " + (weight == 2 ? sel : "") + ">200%</option>";
    content += "</select></div>&nbsp;";
  }
  document.getElementById("powerupsOptions").innerHTML = content;
}
