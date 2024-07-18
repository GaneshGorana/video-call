function ApiError(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        message: `Error: ${message}`
    });
}
export default ApiError