const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const icons = require("lucide-static");
const { getClassesFromTree } = require("@utils/index");
const values = require("@views/global");
const errorHandler = require("@middlewares/errorHandler");
const { isDev } = require("@/config");

function normalizeEjsPath(name) {
  let out = name.replace(path.sep, "").replace("\\", "/");
  if (!out.endsWith(".ejs")) out += ".ejs";
  return out;
}

const cachedContent = {
  blocs: {},
  components: {},
  isCached: false,
};

/**
 * @type {getClassesFromTree}
 */
var blocs;

/**
 * @type {getClassesFromTree}
 */
var components;

function refreshCache() {
  if (cachedContent.isCached) return; // don't refresh if cached

  blocs = getClassesFromTree("app/views/blocs");
  components = getClassesFromTree("app/views/components");

  for (let entry of [...blocs, ...components]) {
    let key = normalizeEjsPath(entry.name);
    const isBloc = blocs.includes(entry);
    const content = fs.readFileSync(path.join(entry.path), "utf8");
    if (isBloc) cachedContent.blocs[key] = content;
    else cachedContent.components[key] = content;
  }

  if (!isDev) cachedContent.isCached = true; // cache in prod
}

module.exports = function (req, res, next) {
  const originalRender = res.render;

  refreshCache();

  res.render = function (view, options = {}, callback) {
    const blocks = {};

    /**
     * @type {{ string:any }}
     */
    const originalOptions = {
      title: values.appname,
      head: "",
      bodyClass: "",
      ...options,
      ...res.locals,
    };

    originalOptions.css = (...files) => {
      return files
        .map((file) => `<link rel="stylesheet" href="${file}">`)
        .join("");
    };

    originalOptions.js = (src) => {
      return `<script src="${src}"></script>`;
    };

    originalOptions.icons = (name, className = "") => {
      if (!name) return null;

      let icon = icons[name];
      if (!icon) {
        const iconPath = (n) => path.join("app", "views", "icons", n);
        const existSVG = (n) => fs.existsSync(iconPath(n));

        if (!name.endsWith(".svg")) name += ".svg";
        if (existSVG(name)) {
          icon = fs.readFileSync(iconPath(name), "utf-8");
        }
      }
      if (icon) {
        if (!icon.includes('class="'))
          icon = icon?.replace("<svg ", `<svg class=""`);

        icon = icon.replace(
          `class="`,
          `class="${values.class.icon} ${className} `
        );
      }

      return icon;
    };

    const globalValues = {
      ...values,
    };
    originalOptions.global = function (name, content = null) {
      if (!name) return globalValues;

      if (!content) {
        if (!globalValues[name]) throw new Error(`Global '${name}' not found`);
        return globalValues[name];
      }

      globalValues[name] = content;
    };
    originalOptions.C = globalValues;

    originalOptions.component = function (name, data = {}) {
      name = normalizeEjsPath(name);
      const content = cachedContent.components[name];
      if (!content) return `Component not found: ${name}`;

      if (Array.isArray(data) || typeof data != "object") {
        data = {
          args: data,
        };
      }
      try {
        const rendered = ejs.render(content, {
          ...originalOptions,
          ...data,
        });
        return rendered;
      } catch (error) {
        if (error.message.includes("is not defined")) {
          const regex = /(\w[\w\d_]*) is not defined/;
          const match = error.message.match(regex);
          if (match) {
            const missing = match[1];
            originalOptions[missing] = null;
            return originalOptions.component(name, data);
          }
        }
        console.log(error.message);
        return `Failed to render component ${name}`;
      }
    };

    originalOptions.bloc = function (name) {
      name = normalizeEjsPath(name);
      const content = cachedContent.blocs[name];
      if (!content) return `Bloc not found: ${name}`;

      try {
        const rendered = ejs.render(content, originalOptions);
        return rendered;
      } catch (error) {
        if (error.message.includes("is not defined")) {
          const regex = /(\w[\w\d_]*) is not defined/;
          const match = error.message.match(regex);
          if (match) {
            const missing = match[1];
            originalOptions[missing] = null;
            return originalOptions.bloc(name);
          }
        }
        console.log(error.message);
        return `Failed to render bloc ${name}`;
      }
    };

    for (let component of components) {
      originalOptions[component.class] = (...datas) => {
        let data = {};
        if (datas.length === 1) data = datas[0];
        else if (datas.length > 1) data = datas;
        return originalOptions.component(component.name, data);
      };
    }

    for (let bloc of blocs) {
      originalOptions[`_${bloc.class}`] = () => originalOptions.bloc(bloc.name);
    }

    originalRender.call(this, view, originalOptions, (err, renderedView) => {
      if (err) {
        req.error = err;
        const isNotFound = err.view && !err.view.path;
        return callback
          ? callback(err)
          : isNotFound
          ? errorHandler.e404(req, res, next)
          : errorHandler.e500(err, req, res, next);
      }

      const blockRegex = /<(\w+)( class=["'][^"']+["'])?>([\s\S]*?)<\/\1>/g;
      let match;
      const bodyScripts = [];
      while ((match = blockRegex.exec(renderedView)) !== null) {
        const name = match[1];
        let className = match[2];
        if (className)
          className = className
            .replaceAll('"', "")
            .replaceAll("'", "")
            .replaceAll("class=", "")
            .trim();
        const content = match[3];
        if (name == "script") {
          bodyScripts.push(content);
        } else {
          blocks[name] = content;
          blocks[name + "Class"] = className;
        }
      }

      if (!blocks.body) {
        blocks.body = renderedView.replace(
          /<script\b[^>]*>([\s\S]*?)<\/script>/g,
          ""
        );
      }

      for (let script of bodyScripts) {
        blocks.body += `<script>${script}</script>`;
      }

      let layout = originalOptions.layout ?? blocks.layout;
      if (!layout) layout = "default";
      if (!layout.endsWith(".ejs")) layout += ".ejs";

      if (blocks.layout) delete blocks.layout;

      const layoutPath = `app/views/layouts/${layout}`;

      fs.readFile(path.resolve(layoutPath), "utf8", (err, layoutTemplate) => {
        if (err) return callback ? callback(err) : next(err);

        try {
          const layoutOptions = {
            ...originalOptions,
            ...blocks,
          };

          const finalHtml = ejs.render(layoutTemplate, layoutOptions);
          if (callback) {
            callback(null, finalHtml);
          } else {
            res.send(finalHtml);
          }
        } catch (err) {
          if (callback) {
            callback(err);
          } else {
            next(err);
          }
        }
      });
    });
  };

  next();
};
