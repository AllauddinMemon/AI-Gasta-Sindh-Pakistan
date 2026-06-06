const ApiError = require('../utils/ApiError');

/**
 * Validates req[source] against a Zod schema. On success, replaces
 * the request data with the parsed (and coerced) result.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
