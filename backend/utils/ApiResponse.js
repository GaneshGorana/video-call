function ApiResponse(res, statusCode, alreayExists, newCreated, message) {
    return res.status(statusCode).json({
        success: true,
        alreayExists: alreayExists,
        newCreated: newCreated,
        message: message
    });
}
export default ApiResponse