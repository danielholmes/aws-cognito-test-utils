import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import { createUserTokensForNow } from "./tokens.ts";
import type { BaseHandlerOptions, HandlerOptions } from "./create-handler.ts";
import { createCognitoPostHandler } from "./create-handler.ts";

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

type InitiateAuthSuccessUserSignInOptions = {
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

type ChallengeNameType =
	| "ADMIN_NO_SRP_AUTH"
	| "CUSTOM_CHALLENGE"
	| "DEVICE_PASSWORD_VERIFIER"
	| "DEVICE_SRP_AUTH"
	| "EMAIL_OTP"
	| "MFA_SETUP"
	| "NEW_PASSWORD_REQUIRED"
	| "PASSWORD"
	| "PASSWORD_SRP"
	| "PASSWORD_VERIFIER"
	| "SELECT_CHALLENGE"
	| "SELECT_MFA_TYPE"
	| "SMS_MFA"
	| "SMS_OTP"
	| "SOFTWARE_TOKEN_MFA"
	| "WEB_AUTHN";

type NewDeviceMetadataType = {
	DeviceKey?: string | undefined;
	DeviceGroupKey?: string | undefined;
};

type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};

type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};

type AuthFlowType =
	| "ADMIN_NO_SRP_AUTH"
	| "ADMIN_USER_PASSWORD_AUTH"
	| "CUSTOM_AUTH"
	| "REFRESH_TOKEN"
	| "REFRESH_TOKEN_AUTH"
	| "USER_AUTH"
	| "USER_PASSWORD_AUTH"
	| "USER_SRP_AUTH";

type AuthenticationResultType = {
	AccessToken?: string | undefined;
	ExpiresIn?: number | undefined;
	TokenType?: string | undefined;
	RefreshToken?: string | undefined;
	IdToken?: string | undefined;
	NewDeviceMetadata?: NewDeviceMetadataType | undefined;
};

type InitiateAuthRequest = {
	AuthFlow: AuthFlowType | undefined;
	AuthParameters?: Record<string, string> | undefined;
	ClientMetadata?: Record<string, string> | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	UserContextData?: UserContextDataType | undefined;
	Session?: string | undefined;
};

type InitiateAuthResponse = {
	ChallengeName?: ChallengeNameType | undefined;
	Session?: string | undefined;
	ChallengeParameters?: Record<string, string> | undefined;
	AuthenticationResult?: AuthenticationResultType | undefined;
	AvailableChallenges?: ChallengeNameType[] | undefined;
};

function initiateAuthHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	request: InitiateAuthRequest,
	response?: InitiateAuthResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.InitiateAuth",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: response ?? {
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
		},
		handlerOptions,
	);
}

export type {
	InitiateAuthNewPasswordRequiredOptions,
	InitiateAuthNonConfirmedUserSignInOptions,
	InitiateAuthSuccessUserSignInOptions,
	InitiateAuthRequest,
	InitiateAuthResponse,
};
export {
	initiateAuthHandler,
	initiateAuthSuccessUserSignInHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthNewPasswordRequiredHandlers,
};
