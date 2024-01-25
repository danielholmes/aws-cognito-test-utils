import { createRestHandlersFactory } from "@dhau/msw-builders";
import { partial } from "lodash-es";
import changePasswordHandler from "./change-password";
import confirmSignUpHandler from "./confirm-sign-up";
import { BaseHandlerOptions } from "./create-handler";
import {
	initiateAuthNewPasswordRequiredHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthSuccessUserSignInHandlers,
} from "./initiate-auth";
import resendConfirmationCodeHandler from "./resend-confirmation-code";
import { createCognitoBaseUrl } from "./utils";
import signUpHandler from "./sign-up";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly region: string;
	readonly debug?: boolean;
};

function createCognitoHandlersFactory({ debug, ...baseOptions }: Options) {
	const { region } = baseOptions;
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
			baseOptions,
		),
		signUpHandler: partial(signUpHandler, builders, baseOptions),
		confirmSignUpHandler: partial(confirmSignUpHandler, builders, baseOptions),
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
