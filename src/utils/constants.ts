// model to store constants
class Constants {
    httpStatus: {
        success: number;
        unauthorized: number;
        forbidden: number;
        serverError: number;
        noContent: number;
        notFound: number;
        badRequest: number;
        conflict: number;
        tooManyRequests: number;
        notAllowed: number;
        serviceUnavailable: number;
        modified: number;
    };
    constructor() {
        this.httpStatus = {
            success: 200,
            unauthorized: 401,
            forbidden: 403,
            serverError: 500,
            noContent: 204,
            notFound: 404,
            badRequest: 400,
            conflict: 409,
            tooManyRequests: 429,
            notAllowed: 405,
            serviceUnavailable: 503,
            modified: 302,
        };
    }
}
export default new Constants();