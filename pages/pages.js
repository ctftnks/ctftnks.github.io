

// create page div in container, load content into page
pageID = 0;
loadedScripts = [];
function openPage(name) {
  var id = pageID++;
  var p = "<div class='page' id='page" + id + "'></div>";
  document.getElementById("pageContainer").innerHTML += p;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // include html file
      var p = document.getElementById("page" + id);
      p.innerHTML = this.responseText;
      // include script
      if (loadedScripts.indexOf(name) == -1) {
        var script = document.createElement("script");
        script.src = "pages/" + name + "/main.js";
        script.onload = function () {
          // execute script tags
          evalscripts(p);
          databinding();
        };
        document.head.appendChild(script);
        loadedScripts.push(name);
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "pages/" + name + "/style.css";
        document.head.appendChild(link);
      } else {
        evalscripts(p);
        databinding();
      }
    }
  };
  xhttp.open("GET", "pages/" + name + "/main.html", true);
  xhttp.send();
  return id;
}

// close a page by ID or child
function closePage(id) {
  if (typeof (id) == "number") {
    var elem = document.getElementById("page" + id);
    if (elem != null && typeof (elem) !== "undefined")
      elem.parentNode.removeChild(elem);
  }
  if (typeof (id) == "object") {
    var count = 0;
    while (!id.matches(".page") || count > 100) {
      id = id.parentNode;
      count++;
    }
    id.parentNode.removeChild(id);
  }
}

// evaluate script tags of element
function evalscripts(elem) {
  var scripts = elem.getElementsByTagName('script');
  for (var n = 0; n < scripts.length; n++)
    eval(scripts[n].innerHTML);
}
