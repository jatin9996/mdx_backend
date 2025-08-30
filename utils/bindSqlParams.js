
export function bindSqlParams(request, paramMap) {
    Object.entries(paramMap).forEach(([key, value]) => {
        request.input(key, value ?? null);
    });
    return request;
}
