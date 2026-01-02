import { store, Settings } from "./store";

// databinding for menus and options
export function databinding(): void {
  // input elements
  [].forEach.call(document.querySelectorAll("input[data-bind]"), (elem: HTMLInputElement) => {
    const bind = elem.getAttribute("data-bind");
    const prefix = elem.hasAttribute("data-prefix") ? elem.getAttribute("data-prefix") : "";
    const suffix = elem.hasAttribute("data-suffix") ? elem.getAttribute("data-suffix") : "";

    if (!bind || !(bind in Settings)) {
      console.error("databinding: " + bind + " not found in Settings");
      return;
    }

    let val = (Settings as any)[bind];
    val = dataminmax(val, elem, bind);
    elem.value = prefix + "" + val + "" + suffix;

    elem.onchange = function () {
      let val = elem.value;
      // remove suffix if present to get numeric value
      if (suffix && val.endsWith(suffix)) {
        val = val.substring(0, val.length - suffix.length);
      }

      // remove prefix if present
      if (prefix && val.startsWith(prefix)) {
        val = val.substring(prefix.length);
      }

      const numericVal = dataminmax(Number(val), elem, bind);

      if (elem.hasAttribute("data-type") && elem.getAttribute("data-type") === "string") {
        (Settings as any)[bind] = String(numericVal);
      } else {
        (Settings as any)[bind] = Number(numericVal);
      }

      store.saveSettings();
    };
  });

  // select elements
  [].forEach.call(document.querySelectorAll("select[data-bind]"), (elem: HTMLSelectElement) => {
    const bind = elem.getAttribute("data-bind");
    if (!bind || !(bind in Settings)) {
      console.error("databinding: " + bind + " not found in Settings");
      return;
    }

    const val = (Settings as any)[bind];
    elem.value = val;
    elem.onchange = function () {
      const val = elem.value;
      if (elem.hasAttribute("data-type") && elem.getAttribute("data-type") === "string") {
        (Settings as any)[bind] = val;
      } else if (val === "true") {
        // handle boolean selects if any
        (Settings as any)[bind] = true;
      } else if (val === "false") {
        (Settings as any)[bind] = false;
      } else {
        (Settings as any)[bind] = Number(val);
      }

      store.saveSettings();
    };
  });
}

function dataminmax(val: number, elem: HTMLElement, bind: string): number {
  if (typeof val !== "number" || isNaN(val)) {
    return val;
  }

  if (elem.hasAttribute("data-min")) {
    const min = Number(elem.getAttribute("data-min"));
    if (val < min) {
      val = min;
    }
  }
  if (elem.hasAttribute("data-max")) {
    const max = Number(elem.getAttribute("data-max"));
    if (val > max) {
      val = max;
    }
  }
  (Settings as any)[bind] = val;
  return val;
}
