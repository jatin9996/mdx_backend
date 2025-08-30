import { parseBasicAuthHeader, validateCredentials } from "../utils/authUtils.js";
import {
    sendBadRequest
} from "../utils/responseHelper.js";

export function basicAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const credentials = parseBasicAuthHeader(authHeader);

    if (!credentials || !credentials.userid || !credentials.password) {
        return sendBadRequest(res, "Missing or invalid Authorization header")
    }
    const { userid, password } = credentials;
    if (!validateCredentials(userid, password)) {
        return sendBadRequest(res, "Invalid credentials")
    }

    req.authUser = { userid };
    next();
}

