import axios from "axios";

export async function fetchHelper(apiUrl, data, externalAuthHeader) {
    try {
        const response = await axios.post(apiUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": externalAuthHeader,
            }
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Bio Metric Data API error:", error?.response?.data || error.message);

        return {
            success: false,
            error: error?.response?.data || error.message,
        };
    }
}
