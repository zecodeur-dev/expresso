const { encrypt } = require("@/app/services/crypto/crypto.service");
const { getTree } = require("@/app/utils");
const config = require("@/config");
const express = require("express");
const path = require("path");

/**
 *
 * @param {string} route
 */
const normalizeRoute = (route) => {
  let out = route;
  if (out.startsWith("/")) out = out.slice(1);
  if (out.endsWith("/")) out = out.slice(0, -1);
  return out;
};

class FSRouter {
  #basePath;
  #layout;
  #ignorePath;

  #context = {};
  #controller = {};
  _instance = express.Router();

  /**
   *
   * @param {string} basePath
   * @param {{ layout:string, ignorePath:boolean }} options
   */
  constructor(basePath = "", ignorePath = true) {
    this.#ignorePath = ignorePath;

    this.#basePath = normalizeRoute(basePath);
    const cachedRoutes = this.#getRoutes();

    this._instance.use((_, __, n) => {
      const routes = config.isDev ? this.#getRoutes() : cachedRoutes;
      const staticRoutes = routes.filter((r) => !r.route.includes(":")).sort();
      const dynamicRoutes = routes.filter((r) => r.route.includes(":")).sort();

      for (let route of [...staticRoutes, ...dynamicRoutes]) {
        const handler = this.#controller[route.handlerKey];
        this._instance.get(route.route, async (req, res, next) => {
          const globalData = { ...this.#context };
          for (let k of Object.keys(this.#context)) {
            if (typeof this.#context[k] == "function")
              globalData[k] = await this.#context[k].bind(this.#context)(
                req,
                res
              );
          }
          try {
            const routeData = handler
              ? typeof handler == "function"
                ? await handler.bind(this.#controller)(req, res)
                : handler
              : {};

            res.render(route.view, {
              layout: this.#layout,
              ...globalData,
              ...routeData,
            });
          } catch (error) {
            console.log("yooo");
            next(error);
          }
        });
      }

      n();
    });
  }

  /**
   * @param  {...import("types").HandlerType} handlers
   */
  middlewares(...handlers) {
    this._instance.use(...handlers);
    return this;
  }

  /**
   * @param {string} layout
   */
  layout(layout) {
    this.#layout = layout;
    return this;
  }

  /**
   * @param {{ string:import("types").HandlerType|object }} context - Global context of data shared by all routes
   */
  context(context = {}) {
    this.#context = context;
    return this;
  }

  /**
   * @param {{ string:import("types").HandlerType|object }} controller - Controller of local context on each route
   */
  controller(controller = {}) {
    this.#controller = controller;
    return this;
  }

  #getRoutes = () => {
    const dir = path.join(config.viewsDir, this.#basePath);
    return getTree(dir).map((p) => {
      const parts = p
        .replace(path.join(config.viewsDir), "")
        .split(path.sep)
        .map((v) => (v == "index.ejs" ? "" : v.replace(/\.ejs/g, "")));

      const view = normalizeRoute(parts.join("/"));
      let route = `${normalizeRoute(parts.join("/").replace(/\$/g, ":"))}`;
      if (this.#ignorePath)
        route = normalizeRoute(route.replace(this.#basePath, ""));
      route = `/${route}`;

      let handlerKey = normalizeRoute(view.replace(this.#basePath, ""))
        .replace(/\//g, "__")
        .replace(/\W/g, "_");
      if (!handlerKey.trim()) handlerKey = "index";
      return {
        view,
        route,
        handlerKey,
      };
    });
  };
}

module.exports = FSRouter;
