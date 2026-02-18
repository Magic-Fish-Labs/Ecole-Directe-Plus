export type AccountDataDispatch<T> = (value: T | ((prevState: T) => T)) => void
export type AccountDataEntry<T> = { value: T, set: AccountDataDispatch<T> }
