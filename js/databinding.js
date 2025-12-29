import { store, Settings } from "./state.js";

// databinding for menus and options
export function databinding() {
  // input elements
  [].forEach.call(document.querySelectorAll("input[data-bind]"), function (elem) {
    var bind = elem.getAttribute("data-bind");
    var prefix = elem.hasAttribute("data-prefix") ? elem.getAttribute("data-prefix") : "";
    var suffix = elem.hasAttribute("data-suffix") ? elem.getAttribute("data-suffix") : "";
    
    if (!(bind in Settings)) {
        console.error("databinding: " + bind + " not found in Settings");
        return;
    }

    var val = Settings[bind];
    val = dataminmax(val, elem, bind);
    elem.value = prefix + "" + val + "" + suffix;
    
    elem.onchange = function () {
      var val = elem.value;
      // remove suffix if present to get numeric value
      if (suffix && val.endsWith(suffix)) {
          val = val.substring(0, val.length - suffix.length);
      }
      // remove prefix if present
      if (prefix && val.startsWith(prefix)) {
          val = val.substring(prefix.length);
      }
      
      val = dataminmax(Number(val), elem, bind);
      
      if (elem.hasAttribute("data-type") && elem.getAttribute("data-type") == "string") {
          Settings[bind] = String(val);
      } else {
          Settings[bind] = Number(val);
      }
      store.saveSettings();
    };
  });
  
  // select elements
  [].forEach.call(document.querySelectorAll("select[data-bind]"), function (elem) {
    var bind = elem.getAttribute("data-bind");
    if (!(bind in Settings)) {
        console.error("databinding: " + bind + " not found in Settings");
        return;
    }
    
    var val = Settings[bind];
    elem.value = val;
    elem.onchange = function () {
      var val = elem.value;
      if (elem.hasAttribute("data-type") && elem.getAttribute("data-type") == "string") {
          Settings[bind] = val;
      } else {
          // handle boolean selects if any
          if (val === "true") Settings[bind] = true;
          else if (val === "false") Settings[bind] = false;
          else Settings[bind] = Number(val);
      }
      store.saveSettings();
    };
  });
}

function dataminmax(val, elem, bind) {
  if (typeof val != "number" || isNaN(val)) return val;

  if (elem.hasAttribute("data-min")) {
    var min = Number(elem.getAttribute("data-min"));
    if (val < min) val = min;
  }
  if (elem.hasAttribute("data-max")) {
    var max = Number(elem.getAttribute("data-max"));
    if (val > max) val = max;
  }
  Settings[bind] = val;
  return val;
}

window.databinding = databinding;

