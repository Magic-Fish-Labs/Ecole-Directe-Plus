export default class EdpError extends Error {
    constructor (errorBuilder) {
        super(errorBuilder.message);
        this.name = errorBuilder.name;
        this.code = errorBuilder.code;
        this.type = "ED_ERROR";
    }
}