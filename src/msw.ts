import { createRestHandlersFactory } from "@dhau/msw-builders";
import partial from "lodash-es/partial.js";
import { HttpHandler } from "msw";
import changePasswordHandler, {
	ChangePasswordOptions,
} from "./change-password.ts";
import confirmSignUpHandler, {
	ConfirmSignUpOptions,
} from "./confirm-sign-up.ts";
import { BaseHandlerOptions } from "./create-handler.ts";
import {
	InitiateAuthNewPasswordRequiredOptions,
	InitiateAuthNonConfirmedUserSignInOptions,
	InitiateAuthSuccessUserSignInOptions,
	initiateAuthNewPasswordRequiredHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthSuccessUserSignInHandlers,
} from "./initiate-auth.ts";
import resendConfirmationCodeHandler, {
	ResendConfirmationCodeOptions,
} from "./resend-confirmation-code.ts";
import { createCognitoBaseUrl } from "./utils.ts";
import signUpHandler, { SignUpOptions } from "./sign-up.ts";
import getUserHandler, { GetUserOptions } from "./get-user.ts";
import {
	ConfirmForgotPasswordOptions,
	ForgotPasswordOptions,
	confirmForgotPasswordHandler,
	forgotPasswordHandler,
} from "./forgot-password.ts";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
};

type CognitoHandlersFactory = {
	forgotPasswordHandler: (options: ForgotPasswordOptions) => HttpHandler;
	confirmForgotPasswordHandler: (
		options: ConfirmForgotPasswordOptions,
	) => HttpHandler;
	changePasswordHandler: (options: ChangePasswordOptions) => HttpHandler;
	initiateAuthNonConfirmedUserSignInHandlers: (
		options: InitiateAuthNonConfirmedUserSignInOptions,
	) => readonly HttpHandler[];
	initiateAuthNewPasswordRequiredHandlers: (
		options: InitiateAuthNewPasswordRequiredOptions,
	) => readonly HttpHandler[];
	initiateAuthSuccessUserSignInHandlers: (
		options: InitiateAuthSuccessUserSignInOptions,
	) => readonly HttpHandler[];
	signUpHandler: (options: SignUpOptions) => HttpHandler;
	confirmSignUpHandler: (options: ConfirmSignUpOptions) => HttpHandler;
	getUserHandler: (options: GetUserOptions) => HttpHandler;
	resendConfirmationCodeHandler: (
		options: ResendConfirmationCodeOptions,
	) => HttpHandler;
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

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
