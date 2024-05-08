import { createRestHandlersFactory } from "@dhau/msw-builders";
import { partial } from "lodash-es";
import changePasswordHandler from "./change-password.ts";
import confirmSignUpHandler from "./confirm-sign-up.ts";
import { BaseHandlerOptions } from "./create-handler.ts";
import {
	initiateAuthNewPasswordRequiredHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthSuccessUserSignInHandlers,
} from "./initiate-auth.ts";
import resendConfirmationCodeHandler from "./resend-confirmation-code.ts";
import { createCognitoBaseUrl } from "./utils.ts";
import signUpHandler from "./sign-up.ts";
import getUserHandler from "./get-user.ts";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
};

function createCognitoHandlersFactory({ debug, ...baseOptions }: Options) {
	// TODO: Validate user pool id format
	const { userPoolId } = baseOptions;
	const region = userPoolId.split("_")[0];
	const builders = createRestHandlersFactory({
		url: createCognitoBaseUrl(region),
		debug,
	});
	return {
		changePasswordHandler: partial(changePasswordHandler, builders),
		initiateAuthNonConfirmedUserSignInHandlers: partial(
			initiateAuthNonConfirmedUserSignInHandlers,
			builders,
			baseOptions,
		),
		initiateAuthNewPasswordRequiredHandlers: partial(
			initiateAuthNewPasswordRequiredHandlers,
			builders,
			baseOptions,
		),
		initiateAuthSuccessUserSignInHandlers: partial(
			initiateAuthSuccessUserSignInHandlers,
			builders,
			{
				...baseOptions,
				region,
			},
		),
		signUpHandler: partial(signUpHandler, builders, baseOptions),
		confirmSignUpHandler: partial(confirmSignUpHandler, builders, baseOptions),
		getUserHandler: partial(getUserHandler, builders, baseOptions),
		resendConfirmationCodeHandler: partial(
			resendConfirmationCodeHandler,
			builders,
			baseOptions,
		),
	};
}

type CognitoHandlersFactory = ReturnType<typeof createCognitoHandlersFactory>;

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
