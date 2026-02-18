export type AccountSettingsDispatch<T> = (value: T | ((prevState: T) => T)) => void
export type AccountSettingsSimpleEntry<T> = { value: T, set: AccountSettingsDispatch<T> }
