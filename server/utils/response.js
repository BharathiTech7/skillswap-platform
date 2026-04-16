exports.successResponse = (res, data, message = "Success") => {
  res.json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message = "Error", status = 500) => {
  res.status(status).json({
    success: false,
    message
  });
};