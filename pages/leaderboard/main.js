function updateLeaderboard() {
  players.sort(function (a, b) {
    return a.score < b.score;
  });
  var lb = document.getElementById("leaderboard");
  var content = "";
  content += "<table>";
  content += "<tr>";
  content += "<th>Name</th>";
  content += "<th>Score</th>";
  content += "<th>Kills</th>";
  content += "<th>Deaths</th>";
  content += "<th>Shots</th>";
  content += "<th>Miles</th>";
  content += "</tr>";
  for (var i in players) {
    var p = players[i];
    content += "<tr>";
    content += "<td>" + p.name + "</td>";
    content += "<td>" + p.score + "</td>";
    content += "<td>" + p.stats.kills + "</td>";
    content += "<td>" + p.stats.deaths + "</td>";
    content += "<td>" + p.stats.shots + "</td>";
    content += "<td>" + Math.round(p.stats.miles / 100) + "</td>";
    content += "</tr>";
  }
  content += "</table>";
  lb.innerHTML = content;
}
