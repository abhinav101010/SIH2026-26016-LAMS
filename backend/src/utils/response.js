const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  })
}

const errorResponse = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message,
  })
}

const paginatedResponse = (res, data, pagination) => {
  res.json({
    success: true,
    data,
    pagination,
  })
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
}
