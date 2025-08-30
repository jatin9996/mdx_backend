// Success without data (used for insert/update/delete success)
export function sendSuccess(res, message) {
    return res.status(200).json({
        header: {
            status: 200,
            message,
        }
    });
}

// Success with data (used for GET/listing APIs)
export function sendSuccessWithData(res, message, data) {
    return res.status(200).json({
        header: {
            status: 200,
            message,
        },
        data,
    });
}

export function sendBadRequest(res, message, errors = null) {
    return res.status(400).json({
        header: {
            status: 400,
            message,
        },
        data: errors,
    });
}

export function sendUnauthorized(res, message) {
    return res.status(401).json({
        header: {
            status: 401,
            message,
        },
        data: null,
    });
}

export function sendServerError(res, message, error = null) {
    return res.status(500).json({
        header: {
            status: 500,
            message,
        },
        data: error ? { error } : null,
    });
}
