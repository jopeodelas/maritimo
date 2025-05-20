"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorTypes_1 = require("../utils/errorTypes");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof errorTypes_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }
    // Default to 500 server error
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    next(new errorTypes_1.NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
