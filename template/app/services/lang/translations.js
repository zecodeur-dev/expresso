const fs = require("fs");
const path = require("path");
const available_langs = fs.readdirSync(path.resolve("translations"));
const translations = {};

for (let l of available_langs) {
  const name = l.replace(".json", "");
  const json = require(path.resolve("translations", l));
  translations[name] = json;
}

module.exports = translations;
