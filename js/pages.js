

// create page div in container, load content into page
pageID = 0;
function openPage(name){
  var id = pageID++;
  var p = "<div class='page' id='page"+id+"'></div>";
  document.getElementById("pageContainer").innerHTML += p;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log("page"+id);
      console.log(document.getElementById("page"+id));
     document.getElementById("page"+id).innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "pages/"+name+"/main.html", true);
  xhttp.send();
  return id;
}

// close a page by ID or child
function closePage(id){
  if(typeof(id) == "number"){
    var elem = document.getElementById("page"+id);
    elem.parentNode.removeChild(elem);
  }
  if(typeof(id) == "object"){
    var elem = id.parentNode;
    elem.parentNode.removeChild(elem);
  }
}
