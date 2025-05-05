const Errors = require("../../config/errors");
const config = require("@/config");


exports.e500 = (err, req, res, next) => {
  const error = Errors.from(req, res);
  const status = err.status || 500;
  console.error(err);
  res.status(err.status || 500).render("error", {
    title: status,
    devMode: config.isDev,
    message:
      err.message && config.isDev
        ? err.message
        : error.code.SERVER_ERROR.message,
  });
};

exports.e404 = (req, res, next) => {
  const error = Errors.from(req, res);

  res.status(404).render("error", {
    title: "404",
    devMode: config.isDev,
    message:
      req.error?.message && config.isDev
        ? req.error?.message
        : error.code.PAGE_NOT_FOUND.message,
  });

};

exports.e400 = (req, res, next) => {
  const error = Errors.from(req, res);
  res.status(400).render("error", {
    title: "400",
    devMode: config.isDev,
    message:
      req.error?.message && config.isDev
        ? req.error?.message
        : error.code.INVALID_REQUEST.message,
  });
};
