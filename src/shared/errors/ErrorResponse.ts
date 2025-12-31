export class ErrorResponse extends Error {
    constructor(public message: string, public code: number, public error?: string) {
        if (error) console.error(error);
        super(message);
    }
}