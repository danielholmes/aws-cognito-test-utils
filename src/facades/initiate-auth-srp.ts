import type { RestHandlersFactory } from "@dhau/msw-builders";
import initiateAuthHandler from "../actions/initiate-auth.ts";
import type { RespondToAuthChallengeResponse } from "../actions/respond-to-auth-challenge.ts";
import respondToAuthChallengeHandler from "../actions/respond-to-auth-challenge.ts";
import type { UserTokens } from "../tokens/types.ts";
import {
	type GenerateCognitoUserTokensConfig,
	generateCognitoUserTokens,
} from "../tokens/generate.ts";

type BaseInitiateAuthSrpOptions = {
	readonly username: string;
	readonly userId: string;
	readonly onCalled?: () => void;
};

function baseInitiateAuthSrpHandlers(
	factory: RestHandlersFactory,
	{ username, userId, onCalled }: BaseInitiateAuthSrpOptions,
	response: RespondToAuthChallengeResponse,
) {
	return [
		initiateAuthHandler(
			factory,
			{
				AuthFlow: "USER_SRP_AUTH",
				AuthParameters: {
					USERNAME: username,
				},
				ClientMetadata: {},
			},
			{
				ChallengeName: "PASSWORD_VERIFIER",
				ChallengeParameters: {
					SALT: "salt123",
					SECRET_BLOCK: "secret-block",
					SRP_B: "srpB",
					USERNAME: userId,
					USER_ID_FOR_SRP: userId,
				},
			},
		),
		respondToAuthChallengeHandler(
			factory,
			{
				ChallengeName: "PASSWORD_VERIFIER",
				ChallengeResponses: {
					USERNAME: userId,
				},
			},
			response,
			{
				onCalled,
			},
		),
	];
}

type InitiateAuthSrpTotpOptions = BaseInitiateAuthSrpOptions & {
	readonly responseSession: string;
};

function initiateAuthSrpTotpHandlers(
	factory: RestHandlersFactory,
	{ responseSession, ...options }: InitiateAuthSrpTotpOptions,
) {
	return baseInitiateAuthSrpHandlers(factory, options, {
		ChallengeName: "SOFTWARE_TOKEN_MFA",
		ChallengeParameters: {},
		Session: responseSession,
	});
}

type InitiateAuthSrpSuccessOptions = BaseInitiateAuthSrpOptions & {
	readonly tokens?: UserTokens;
};

function initiateAuthSrpSuccessHandlers(
	factory: RestHandlersFactory,
	generateOptions: GenerateCognitoUserTokensConfig,
	{ tokens, ...options }: InitiateAuthSrpSuccessOptions,
) {
	return baseInitiateAuthSrpHandlers(factory, options, {
		AuthenticationResult: {
			...(tokens ??
				generateCognitoUserTokens(generateOptions, {
					Username: options.username,
				})),
			TokenType: "Bearer",
		},
		ChallengeParameters: {},
	});
}

type InitiateAuthSrpNewPasswordOptions = BaseInitiateAuthSrpOptions & {
	readonly responseSession: string;
	readonly userAttributes: Record<string, string>;
};

function initiateAuthSrpNewPasswordHandlers(
	factory: RestHandlersFactory,
	{
		responseSession,
		userAttributes,
		...options
	}: InitiateAuthSrpNewPasswordOptions,
) {
	return baseInitiateAuthSrpHandlers(factory, options, {
		ChallengeName: "NEW_PASSWORD_REQUIRED",
		ChallengeParameters: {
			requiredAttributes: "[]",
			userAttributes: JSON.stringify(userAttributes),
			Session: responseSession,
		},
	});
}

export type {
	InitiateAuthSrpSuccessOptions,
	InitiateAuthSrpNewPasswordOptions,
	InitiateAuthSrpTotpOptions,
};
export {
	initiateAuthSrpTotpHandlers,
	initiateAuthSrpNewPasswordHandlers,
	initiateAuthSrpSuccessHandlers,
};
