import { LoginCodes, LoginStates } from "../../constants/codes";
import { guestCredentials, guestDataPath } from "../../constants/config";
import mapLogin from "../../mappers/login";
import fetchLogin from "../../requests/fetchLogin";

export async function requestLogin(account, onLogin, localUsername, localPassword, keepLoggedIn, controller = new AbortController()) {
	let response;
	if (localUsername === guestCredentials.username && localPassword === guestCredentials.password) {
		response = import(/* @vite-ignore */ guestDataPath.login)
	} else {
		response = fetchLogin(localUsername, localPassword, account.doubleAuthKey.current, controller)
	}

	return response
		.then((response) => {
			console.error(response)
			switch (response.code) {
				case 200:
					account.token.set(response.token); // collecte du token
					const users = mapLogin(response.data);
					account.users.set(users);
					account.loginStates.set(LoginStates.LOGGED_IN);
					if (keepLoggedIn) {
						account.userCredentials.username.set(localUsername);
						account.userCredentials.password.set(localPassword);
					} else {
						account.userCredentials.username.set("");
						account.userCredentials.password.set("");
					}
					onLogin(users);
					return LoginCodes.SUCCESS;
				case 250:
					account.doubleAuthKey.current = null;
					account.token.set(response.token); // collecte du token pour l'a2f
					account.doubleAuthToken.set(response.doubleAuthToken); // collecte de l'autre token pour l'a2f
					account.loginStates.set(LoginStates.REQUIRE_DOUBLE_AUTH);
					return LoginCodes.REQUIRE_DOUBLE_AUTH;
				case 202:
					account.loginStates.set(LoginStates.REQUIRE_LOGIN);
					return LoginCodes.ACCOUNT_CREATION_ERROR;
				case -1:
					account.loginStates.set(LoginStates.BANNED_USER);
					return LoginCodes.EMPTY_RESPONSE;
				default: // UNHANDLED ERROR
					// !:! report l'erreur
					console.error(response);
					return { code: -1, message: response.message };
			}
		})
		.catch((error) => {
			if (error.type === "ED_ERROR") {
				if (error.code < 0) {
					account.loginStates.set(LoginStates.BANNED_USER);
				} else {
					account.loginStates.set(LoginStates.REQUIRE_LOGIN);
				}
				switch (error.code) {
					case 1:
						return LoginCodes.NO_EXT_RESPONSE;
					case 2:
						return LoginCodes.EXT_NO_GTK_COOKIE;
					case 3:
						return LoginCodes.EXT_NO_COOKIE;
					case 505:
						return LoginCodes.INVALID_CREDENTIALS;
					case 74000:
						return LoginCodes.SERVER_ERROR;
					case -1:
						return LoginCodes.EMPTY_RESPONSE;
					default:
						return { code: -1, message: error.message };
				}
			}
			if (error.name !== "AbortError") {
				console.error(error);
				return { code: -1, message: error.message };
			} // !:! report l'erreur
		});
}