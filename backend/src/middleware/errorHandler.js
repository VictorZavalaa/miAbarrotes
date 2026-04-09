function notFoundHandler(req, res) {
    res.status(404).json({
        ok: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'La imagen excede el tamaño permitido (máximo 2MB)';
    }

    if (process.env.NODE_ENV !== 'test') {
        console.error(err);
    }

    res.status(statusCode).json({
        ok: false,
        message
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
