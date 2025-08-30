export function parseBasicAuthHeader(header) {
    if (!header || !header.startsWith("Basic ")) return null;

    const base64 = header.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("ascii");
    const [userid, password] = decoded.split(":");

    return { userid, password };
}

export function validateCredentials(userid, password) {
    const STATIC_USER = process.env.STATIC_USER;
    const STATIC_PASS = process.env.STATIC_PASS;
    return userid === STATIC_USER && password === STATIC_PASS;
}
