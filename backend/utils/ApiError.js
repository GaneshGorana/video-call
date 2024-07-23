function ApiError(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        message: message
    });
}
export default ApiError