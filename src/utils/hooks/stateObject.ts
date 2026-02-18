import { Dispatch, SetStateAction } from "react";

export interface StateObject<T> {
	value: T,
	set: Dispatch<SetStateAction<T>>
}

export function stateObject<T>(value: T, setter: Dispatch<SetStateAction<T>>): StateObject<T> {
	return { value: value, set: setter };
}
