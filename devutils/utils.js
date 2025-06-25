export function tracer(fn, on = true) {
    return on
    ? (...params) => {
        console.trace(fn.name);
        fn(...params);
    }
    : fn;
}