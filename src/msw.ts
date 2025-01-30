import { createRestHandlersFactory } from "@dhau/msw-builders";
import type { RequestHandlerOptions } from "msw";
import { HttpResponse } from "msw";
import type { BaseHandlerOptions } from "./create-handler.ts";
import { partial, createCognitoBaseUrl } from "./utils.ts";
import changePasswordHandler from "./actions/change-password.ts";
import forgotPasswordHandler from "./actions/forgot-password.ts";
import confirmForgotPasswordHandler from "./actions/confirm-forgot-password.ts";
import signUpHandler from "./actions/sign-up.ts";
import resendConfirmationCodeHandler from "./actions/resend-confirmation-code.ts";
import getUserHandler from "./actions/get-user.ts";
import confirmSignUpHandler from "./actions/confirm-sign-up.ts";
import initiateAuthHandler from "./actions/initiate-auth.ts";
import type { CognitoHandlersFactory } from "./cognito-handlers-factory.ts";
import setUserMFAPreferenceHandler from "./actions/set-user-mfapreference.ts";
import associateSoftwareTokenHandler from "./actions/associate-software-token.ts";
import respondToAuthChallengeHandler from "./actions/respond-to-auth-challenge.ts";
import verifySoftwareTokenHandler from "./actions/verify-software-token.ts";
import { publicKey } from "./tokens/keys.ts";
import {
	type GenerateCognitoUserTokensOptions,
	type User,
	generateCognitoUserTokens,
} from "./tokens/generate.ts";
import {
	initiateAuthSrpNewPasswordHandlers,
	initiateAuthSrpNonConfirmedHandlers,
	initiateAuthSrpSuccessHandlers,
	initiateAuthSrpTotpHandlers,
} from "./facades/initiate-auth-srp.ts";
import adminGetUserHandler from "./actions/admin-get-user.ts";
import listUsersHandler from "./actions/list-users.ts";
import adminSetUserPasswordHandler from "./actions/admin-set-user-password.ts";
import adminDeleteUserHandler from "./actions/admin-delete-user.ts";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
	readonly defaultRequestHandlerOptions?: RequestHandlerOptions;
};

function createCognitoHandlersFactory({
	debug,
	defaultRequestHandlerOptions,
	...baseOptions
}: Options): CognitoHandlersFactory {
	// TODO: Validate user pool id format
	const { userPoolId, userPoolClientId } = baseOptions;
	const region = userPoolId.split("_")[0];
	const url = createCognitoBaseUrl(region);
	const builders = createRestHandlersFactory({
		url,
		debug,
		defaultRequestHandlerOptions,
	});
	return {
		// Actions
		forgotPasswordHandler: partial(forgotPasswordHandler, builders),
		confirmForgotPasswordHandler: partial(
			confirmForgotPasswordHandler,
			builders,
		),
		changePasswordHandler: partial(changePasswordHandler, builders),
		initiateAuthHandler: partial(initiateAuthHandler, builders),
		signUpHandler: partial(signUpHandler, builders),
		confirmSignUpHandler: partial(confirmSignUpHandler, builders),
		getUserHandler: partial(getUserHandler, builders),
		resendConfirmationCodeHandler: partial(
			resendConfirmationCodeHandler,
			builders,
		),
		setUserMFAPreferenceHandler: partial(setUserMFAPreferenceHandler, builders),
		associateSoftwareTokenHandler: partial(
			associateSoftwareTokenHandler,
			builders,
		),
		respondToAuthChallengeHandler: partial(
			respondToAuthChallengeHandler,
			builders,
		),
		verifySoftwareTokenHandler: partial(verifySoftwareTokenHandler, builders),
		adminGetUserHandler: partial(adminGetUserHandler, builders),
		listUsersHandler: partial(listUsersHandler, builders),
		adminSetUserPasswordHandler: partial(adminSetUserPasswordHandler, builders),
		adminDeleteUserHandler: partial(adminDeleteUserHandler, builders),

		// Facades
		initiateAuthSrpSuccessHandlers: partial(
			initiateAuthSrpSuccessHandlers,
			builders,
			{
				issuerDomain: url,
				userPoolId,
				userPoolClientId,
			},
		),
		initiateAuthSrpTotpHandlers: partial(initiateAuthSrpTotpHandlers, builders),
		initiateAuthSrpNewPasswordHandlers: partial(
			initiateAuthSrpNewPasswordHandlers,
			builders,
		),
		initiateAuthSrpNonConfirmedHandlers: partial(
			initiateAuthSrpNonConfirmedHandlers,
			builders,
		),

		// Misc
		wellKnownJwksHandler: () =>
			builders.get(`/${userPoolId}/.well-known/jwks.json`, {}, () =>
				HttpResponse.json({
					keys: [publicKey.jwk],
				}),
			),
		generateUserTokens(user: User, options?: GenerateCognitoUserTokensOptions) {
			return generateCognitoUserTokens(
				{
					issuerDomain: url,
					userPoolId,
					userPoolClientId,
				},
				user,
				options,
			);
		},
	};
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
