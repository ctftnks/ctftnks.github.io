


function clearPlayers() {
  players = [];
}

function quickPvP(nteams, teamsize) {
  players = [];
  nplayers = 0;
  for (var i = 0; i < nteams; i++) {
    for (var j = 0; j < teamsize; j++) {
      players.push(new Player());
      var p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}


function quickPvB(nteams, teamsize) {
  players = [];
  nplayers = 0;
  for (var i = 0; i < nteams; i++) {
    for (var j = 0; j < teamsize; j++) {
      if (i < nteams / 2)
        players.push(new Player());
      else
        players.push(new Bot());
      var p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

function quickMixed(nteams, teamsize) {
  players = [];
  nplayers = 0;
  for (var i = 0; i < nteams; i++) {
    for (var j = 0; j < teamsize; j++) {
      if (j < teamsize / 2)
        players.push(new Player());
      else
        players.push(new Bot());
      var p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

function quickUnevenMixed(nteams, teamsize) {
  players = [];
  nplayers = 0;
  for (var i = 0; i < nteams; i++) {
    for (var j = 0; j < teamsize; j++) {
      if (j < teamsize / 2 && i == 0)
        players.push(new Player());
      else
        players.push(new Bot());
      var p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}
