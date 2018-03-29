

// databinding for menus and options
function databinding(){
  // input elements
  [].forEach.call(document.querySelectorAll('input[data-bind]'), function(elem){
    var bind = elem.getAttribute("data-bind");
    var prefix = elem.hasAttribute("data-prefix") ? elem.getAttribute("data-prefix") : "";
    var suffix = elem.hasAttribute("data-suffix") ? elem.getAttribute("data-suffix") : "";
    var val = eval(bind);
    val = dataminmax(val, elem, bind);
    elem.value = prefix + "" + val + "" + suffix;
    elem.onchange = function(){
      var val = elem.value;
      val = dataminmax(val, elem, bind);
      eval(bind + "=" + val + ";");
    };
  });
  // select elements
  [].forEach.call(document.querySelectorAll('select[data-bind]'), function(elem){
    var bind = elem.getAttribute("data-bind");
    var val = eval(bind);
    elem.value = val;
    elem.onchange = function(){
      eval(bind + "=" + elem.value + ";");
    };
  });
}


function dataminmax(val, elem, bind){
  if(typeof(val) != "number")
    return val;

  if(elem.hasAttribute("data-min")){
    var min = eval(elem.getAttribute("data-min"));
    if(val < min)
      val = min;
  }
  if(elem.hasAttribute("data-max")){
    var max = eval(elem.getAttribute("data-max"));
    if(val > max)
      val = max;
  }
  eval(bind + "=" + val + ";");
  return val;
}
