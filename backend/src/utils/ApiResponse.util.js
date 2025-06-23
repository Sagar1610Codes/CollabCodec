class ApiResponse {
    constructor(
        statusCode, 
        data, 
        message = "Success", 
        meta = null
    ) {
        if (typeof statusCode !== 'number') {
            throw new Error("ApiResponse: statusCode must be a number.");
        }

        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;

        if (meta) {
            this.meta = meta;
        }
    }
}

export { ApiResponse };