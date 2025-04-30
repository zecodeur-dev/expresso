const Errors = require("../../config/errors");

exports.e500 = (err, req, res, next) => {
  const errors = Errors.from(req, res);
  const status = err.status || 500;
  errors.json({
    ...errors.code.SERVER_ERROR,
    code: status,
  });
};

exports.e404 = (req, res, next) => {
  const errors = Errors.from(req, res);
  errors.json(errors.code.RESOURCE_NOT_FOUND);
};

exports.e400 = (req, res, next) => {
  const errors = Errors.from(req, res);
  errors.json(errors.code.INVALID_REQUEST);
};
