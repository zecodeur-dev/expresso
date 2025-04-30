const fs = require("fs");
const path = require("path");

class Utils {
  // For primitive types
  static _string = (str = "") => {
    return {
      _value: str,
      capitalize: () => Utils._string(Utils.capitalize(str)),
      pluralize: () => Utils._string(Utils.pluralize(str)),
      singularize: () => Utils._string(Utils.singularize(str)),
      repeat: (count = 1, sep = "") =>
        Utils._string(Utils.repeat(str, count, sep)),
      randomLetter: () => Utils.randomElement(arr),
    };
  };
  static _array = (arr = []) => {
    return {
      _value: arr,
      randomElement: () => Utils.randomElement(arr),
      toSet: () => Utils.uniqueArray(arr),
      difference: (arr2) => Utils.arrayDifference(arr, arr2),
    };
  };
  static _number = (n) => {
    return {
      _value: n,
      waitForMs: () => Utils.wait(n),
      random: (min = 0) => Utils.random(n, min),
      isRound: () => parseInt(n) == n,
    };
  };

  // Default methods
  static wait(ms = 1000) {
    return new Promise((res, rej) => {
      setTimeout(res, ms);
    });
  }
  static waitForPromises(...promises) {
    return new Promise(async (res, rej) => {
      promises = promises.map((p) => (typeof p == "function" ? p() : p));

      res(
        (await Promise.allSettled(promises)).map((v) =>
          v.status == "fulfilled" ? { value: v.value } : { err: v.reason }
        )
      );
    });
  }

  static random(max, min = 0) {
    return parseInt(Math.random() * (max - min)) + min;
  }

  static toMs({ d, h, m, s, ms }) {
    d = d ?? 0;
    h = h ?? 0;
    m = m ?? 0;
    s = s ?? 0;
    ms = ms ?? 0;

    const stamp =
      ms +
      1000 * s +
      60 * 1000 * m +
      60 * 60 * 1000 * h +
      24 * 60 * 60 * 1000 * d;
    return stamp;
  }

  static randomElement(array) {
    if (typeof array == "string") array = array.split("");

    if (!Array.isArray(array) || array.length === 0) {
      throw new Error("Input must be a non-empty array");
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  static uniqueArray(arr) {
    return [...new Set(arr)];
  }

  static arrayDifference(arr1, arr2) {
    return arr1.filter((x) => !arr2.includes(x));
  }

  static generateRandomString(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static capitalize(str = "") {
    if (typeof str !== "string") {
      throw new Error("Input must be a string");
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static pluralize(word = "") {
    if (word.endsWith("y") && !/[aeiou]y$/.test(word)) {
      return word.slice(0, -1) + "ies";
    } else if (
      word.endsWith("s") ||
      word.endsWith("x") ||
      word.endsWith("z") ||
      word.endsWith("sh") ||
      word.endsWith("ch")
    ) {
      return word + "es";
    } else if (word.endsWith("f")) {
      return word.slice(0, -1) + "ves";
    } else if (word.endsWith("fe")) {
      return word.slice(0, -2) + "ves";
    } else {
      return word + "s";
    }
  }

  static singularize(word = "") {
    if (word.endsWith("ies")) {
      return word.slice(0, -3) + "y";
    } else if (word.endsWith("ves")) {
      return word.slice(0, -3) + "f";
    } else if (
      word.endsWith("es") &&
      (word.endsWith("shes") || word.endsWith("ches"))
    ) {
      return word.slice(0, -2);
    } else if (word.endsWith("es")) {
      return word.slice(0, -2);
    } else if (word.endsWith("s") && !word.endsWith("ss")) {
      return word.slice(0, -1);
    } else {
      return word;
    }
  }

  static repeat(str = "", count = 1, sep = "") {
    return new Array(count).fill(str).join(sep);
  }

  /**
   * 
   * @param {string} dir 
   * @returns {string[]}
   */
  static getTree(dir) {
    const elements = [];
    const content = fs.readdirSync(dir);
    for (let f of content) {
      const fpath = path.join(dir, f);
      const isDir = fs.statSync(fpath).isDirectory();
      if (isDir) {
        elements.push(...Utils.getTree(fpath));
      } else {
        elements.push(fpath);
      }
    }

    return elements;
  }

  static getClassesFromTree(dir) {
    const resolveName = (file) => {
      const resolveDir = path.resolve(dir);
      const resolveFile = path.resolve(file);
      return resolveFile.replace(resolveDir, "");
    };
    const className = (file) => {
      const split = resolveName(file)
        .split(path.sep)
        .filter((s) => !!s)
        .map((p) => p.split(/[^a-zA-Z0-9]/));

      const parts = [];
      for (let s of split) {
        parts.push(
          s
            .filter((v, i) => i == 0 || i < s.length - 1)
            .map((v) => Utils._string(v).capitalize()._value)
            .join("")
        );
      }

      return parts.filter((v) => !!v).join("_");
    };

    return Utils.getTree(dir).map((f) => ({
      path: f,
      name: resolveName(f),
      class: className(f),
    }));
  }
}

module.exports = Utils;
