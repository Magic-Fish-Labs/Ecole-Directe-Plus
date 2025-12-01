
export default class EdError extends Error {
    code: number;
    name: string;
    constructor(errorBuilder: { message: string, name: string, code: number }) {
        super(errorBuilder.message);
        this.name = errorBuilder.name;
        this.code = errorBuilder.code;
    }
}