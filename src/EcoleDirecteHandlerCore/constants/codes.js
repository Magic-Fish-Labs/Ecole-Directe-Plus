
export const LoginStates = {
    LOGGED_IN: 0,
    REQUIRE_LOGIN: 1,
    REQUIRE_DOUBLE_AUTH: 2,
    DOUBLE_AUTH_ACQUIRED: 3,
    BANNED_USER: 4,
    REQUIRE_NEW_TOKEN: 5,
}

export const LoginCodes = {
    SUCCESS:                { code: 0, message: "Login achieved" },
    INVALID_CREDENTIALS:    { code: 1, message: "Invalid credentials" },
    REQUIRE_DOUBLE_AUTH:    { code: 2, message: "Double authentification is needed" },
    SERVER_ERROR:           { code: 3, message: "Couldn't connect to the server, try again later" },
    ACCOUNT_CREATION_ERROR: { code: 4, message: "There is a problem with your account, be sure that it is activated and working" },
    EMPTY_RESPONSE:         { code: 5, message: "You were not able to get a response from EcoleDirecte's servers. You might have send a wrong data format. Another reason could be that you're banned from their services." },
}

export const DoubleAuthCodes = {
    SUCCESS:        { code: 0, message: "Double authentification keys have been successfuly acquired" },
    INVALID_TOKEN:  { code: 1, message: "Invalid token" },
    EXPIRED_TOKEN:  { code: 2, message: "Expired token" },
    INVALID_ANSWER: { code: 3, message: "Invalid answer to double authentification questions. /!\\ this may lock your EcoleDirecte account, check your emails if it is the case" },
}

export const GradesCodes = {
    SUCCESS:        { code: 0, message: "Grades Fetched" },
    INVALID_TOKEN:  { code: 1, message: "Invalid token" },
    EXPIRED_TOKEN:  { code: 2, message: "Expired token" },
}

export const HomeworksCodes = {
    SUCCESS:        { code: 0, message: "Homeworks Fetched" },
    INVALID_TOKEN:  { code: 1, message: "Invalid token" },
    EXPIRED_TOKEN:  { code: 2, message: "Expired token" },
}

export const FetchErrorBuilders = {
    EXPIRED_TOKEN:  { name: "ExpiredToken", code: 520, message: "Expired token" },
    INVALID_TOKEN:  { name: "InvalidToken", code: 525, message: "Invalid token" },
    EMPTY_RESPONSE: { name: "EmptyResponse", code: -1, message: "You were not able to get a response from EcoleDirecte's servers. You're maybe banned from their services" },
    login: {
        INVALID_CREDENTIALS:    { name: "InvalidCredentials", code: 505, message: "Invalid credentials" },
        SERVER_ERROR:           { name: "ServerError", code: 74000, message: "Couldn't connect to the server, try again later" },
    },
    doubleAuth: {
        INVALID_ANSWER: undefined,
    },
}