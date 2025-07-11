export function tracer(fn, on = true) {
    return on
    ? (...params) => {
        console.trace(fn.name, ...params);
        fn(...params);
    }
    : fn;
}