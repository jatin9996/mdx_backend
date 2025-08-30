import { z } from "zod"
export const ValidateRequestData = async (schema, reqdata) => {
    try {
        await schema.parseAsync(reqdata);
        return true;
    } catch (err) {
        if (err instanceof z.ZodError) {
            return {
                statusCode: 400,
                message: err.issues[0].message,
                data: [],
            };
        }
        return {
            statusCode: 400,
            message: "ValidationError",
            data: [],
        };
    }
};
