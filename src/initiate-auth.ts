import { RestHandlersFactory } from "@dhau/msw-builders";
import isMatch from "lodash-es/isMatch.js";
import { createUserTokensForNow } from "./tokens.ts";
import {
	BaseHandlerOptions,
	CognitoPostOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type InitiateAuthNewPasswordRequiredOptions = {
	readonly email: string;
};

function initiateAuthNewPasswordRequiredHandlers(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ email }: InitiateAuthNewPasswordRequiredOptions,
) {
	return [
		createCognitoPostHandler(factory, {
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.InitiateAuth",
			// TODO: Don't know what to check for pw
			bodyMatcher: (b) => {
				return isMatch(b, {
					AuthFlow: "USER_SRP_AUTH",
					AuthParameters: { USERNAME: email },
				});
			},
			matchResponse: {
				status: 200,
				body: {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeParameters: {
						SALT: "salt123",
						SECRET_BLOCK: "secretBlock",
						SRP_B: "srpB",
						USERNAME: "newUsername",
						USER_ID_FOR_SRP: "newUsername",
					},
				},
			},
		}),
		createCognitoPostHandler(factory, {
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
			bodyMatcher: (b) => {
				return isMatch(b, {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeResponses: {
						USERNAME: "newUsername",
					},
				});
			},
			matchResponse: {
				status: 200,
				body: {
					ChallengeName: "NEW_PASSWORD_REQUIRED",
					ChallengeParameters: {
						requiredAttributes: "[]",
						userAttributes: JSON.stringify({
							email_verified: "true",
							email,
						}),
						Session: `session${Math.random()}`,
					},
				},
			},
		}),
	];
}

type InitiateAuthNonConfirmedUserSignInOptions = {
	readonly username: string;
};

function initiateAuthNonConfirmedUserSignInHandlers(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username }: InitiateAuthNonConfirmedUserSignInOptions,
) {
	return [
		createCognitoPostHandler(factory, {
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.InitiateAuth",
			bodyMatcher: (b) => {
				return isMatch(b, {
					AuthFlow: "USER_SRP_AUTH",
					AuthParameters: {
						USERNAME: username,
					},
				});
			},
			matchResponse: {
				status: 200,
				body: {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeParameters: {
						SALT: "salt123",
						SECRET_BLOCK: "secretBlock",
						SRP_B: "srpB",
						USERNAME: "newUsername",
						USER_ID_FOR_SRP: "newUsername",
					},
				},
			},
		}),
		createCognitoPostHandler(factory, {
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
			bodyMatcher: (body) => {
				return isMatch(body, {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeResponses: {
						USERNAME: "newUsername",
					},
				});
			},
			matchResponse: {
				status: 400,
				body: {
					__type: "UserNotConfirmedException",
					message: "User is not confirmed.",
				},
			},
		}),
	];
}

type InitiateAuthSuccessHandlerOptions = BaseHandlerOptions & {
	readonly region: string;
	readonly userPoolId: string;
};

type InitiateAuthSuccessUserSignInOptions = Pick<
	CognitoPostOptions,
	"onCalled"
> & {
	readonly username: string;
};

function initiateAuthSuccessUserSignInHandlers(
	factory: RestHandlersFactory,
	{ region, userPoolId, ...baseOptions }: InitiateAuthSuccessHandlerOptions,
	{ username, ...rest }: InitiateAuthSuccessUserSignInOptions,
) {
	const tokens = createUserTokensForNow({
		region,
		userPoolId,
		userId: username,
		email: username,
		emailVerified: true,
	});
	return [
		createCognitoPostHandler(factory, {
			...baseOptions,
			...rest,
			target: "AWSCognitoIdentityProviderService.InitiateAuth",
			bodyMatcher: (b) => {
				return isMatch(b, {
					AuthFlow: "USER_SRP_AUTH",
					AuthParameters: {
						USERNAME: username,
					},
				});
			},
			matchResponse: {
				status: 200,
				body: {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeParameters: {
						SALT: "salt123",
						SECRET_BLOCK: "secretBlock",
						SRP_B: "srpB",
						USERNAME: "newUsername",
						USER_ID_FOR_SRP: "newUsername",
					},
				},
			},
		}),
		createCognitoPostHandler(factory, {
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
			bodyMatcher: (body) => {
				return isMatch(body, {
					ChallengeName: "PASSWORD_VERIFIER",
					ChallengeResponses: {
						USERNAME: "newUsername",
					},
				});
			},
			matchResponse: {
				status: 200,
				body: {
					AuthenticationResult: {
						AccessToken: tokens.access,
						IdToken: tokens.id,
						RefreshToken: tokens.refresh,
						TokenType: "Bearer",
					},
					ChallengeParameters: {},
				},
			},
		}),
	];
}

export type {
	InitiateAuthNewPasswordRequiredOptions,
	InitiateAuthNonConfirmedUserSignInOptions,
	InitiateAuthSuccessUserSignInOptions,
};
export {
	initiateAuthSuccessUserSignInHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthNewPasswordRequiredHandlers,
};
