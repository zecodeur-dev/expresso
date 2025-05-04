const { getTree } = require("@/app/utils");
const config = require("@/config");
const express = require("express");
const path = require("path");
/**
 *
 * @param {string} basePath
 * @param {{ layout:string, layoutData:object }} options
 */
function FSRouter(basePath, options = {}) {
  const { layout, layoutData } = options;

  const normalizeRoute = (route) => {
    let out = route;
    if (out.startsWith("/")) out = out.slice(1);
    if (out.endsWith("/")) out = out.slice(0, -1);
    return out;
  };

  if (!basePath) basePath = "";
  basePath = normalizeRoute(basePath);

  const dir = path.join(config.viewsDir, basePath);
  const routes = getTree(dir).map((p) => {
    const parts = p
      .replace(path.join(config.viewsDir), "")
      .split(path.sep)
      .map((v) => (v == "index.ejs" ? "" : v.replace(/\.ejs/g, "")));

    const view = normalizeRoute(parts.join("/"));
    const route = `/${normalizeRoute(parts.join("/").replace(/\$/g, ":"))}`;
    let handlerKey = normalizeRoute(view.replace(basePath, "")).replace(
      /\//g,
      "__"
    );
    if (!handlerKey.trim()) handlerKey = "index";
    return {
      view,
      route,
      handlerKey,
    };
  });

  const router = express.Router();

  return {
    /**
     * @param {{ string:import("types").HandlerType|object }} controller
     */
    handle: function (controller = {}) {
      const static = routes.filter((r) => !r.route.includes(":")).sort();
      const dynamic = routes.filter((r) => r.route.includes(":")).sort();
 
      for (let route of [...static, ...dynamic]) {
        const handler = controller[route.handlerKey];
        router.get(route.route, async (req, res, next) => {
          try {
            const data = handler
              ? typeof handler == "function"
                ? await handler.bind(controller)(req, res)
                : handler
              : {};

            res.render(route.view, {
              ...layoutData,
              layout,
              ...data,
            });
          } catch (error) {
            next(error);
          }
        });
      }

      return router;
    },

    /**
     * @param  {...import("types").HandlerType} handlers
     */
    middlewares: function (...handlers) {
      router.use(...handlers);
      return this;
    },
  };
}

module.exports = FSRouter;
