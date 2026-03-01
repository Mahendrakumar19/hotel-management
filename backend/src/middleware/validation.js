const validationMiddleware = (validationResultObj, req, res, next) => {
  // validationResultObj is the result returned by express-validator's validationResult(req)
  if (validationResultObj && typeof validationResultObj.isEmpty === 'function' && !validationResultObj.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: validationResultObj.array()
    });
  }
  next();
};

module.exports = { validationMiddleware };
