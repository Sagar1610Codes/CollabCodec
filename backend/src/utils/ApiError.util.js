class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = Array.isArray(errors) ? errors : [errors];  // Ensures errors is always an array
        Error.captureStackTrace(this, ApiError); // Capture stack trace
    }
}

export { ApiError };
