import { createRestHandlersFactory } from "@dhau/msw-builders";
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

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
};

function createCognitoHandlersFactory({
	debug,
	...baseOptions
}: Options): CognitoHandlersFactory {
	// TODO: Validate user pool id format
	const { userPoolId } = baseOptions;
	const region = userPoolId.split("_")[0];
	const builders = createRestHandlersFactory({
		url: createCognitoBaseUrl(region),
		debug,
	});
	return {
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
	};
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
