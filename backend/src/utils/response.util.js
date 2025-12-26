// src/utils/response.util.js
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 400, data = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    data
  });
};

// Optional generic sendResponse
export const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};
