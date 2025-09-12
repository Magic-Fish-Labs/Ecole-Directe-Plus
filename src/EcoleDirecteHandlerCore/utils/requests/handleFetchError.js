import { CommonCodes, LoginStates } from "../../constants/codes";

export function handleFetchError(error, setLoginState = null) {
	if (error.type === "ED_ERROR") {
		switch (error.code) {
			case 520:
				return CommonCodes.INVALID_TOKEN;
			case 525:
				return CommonCodes.EXPIRED_TOKEN;
			default:
				return { code: -1, message: error.message };
		}
	}
	if (error.name !== "AbortError") {
		if (setLoginState)
			setLoginState(LoginStates.REQUIRE_LOGIN);
		console.error(error);
		return { code: -1, message: error.message };
	}
}