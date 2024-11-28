import { createRestHandlersFactory } from "@dhau/msw-builders";
import type { HttpHandler } from "msw";
import type { ChangePasswordOptions } from "./change-password.ts";
import changePasswordHandler from "./change-password.ts";
import type {
	ConfirmSignUpRequest,
	ConfirmSignUpResponse,
} from "./confirm-sign-up.ts";
import confirmSignUpHandler from "./confirm-sign-up.ts";
import type { BaseHandlerOptions, HandlerOptions } from "./create-handler.ts";
import type {
	InitiateAuthNewPasswordRequiredOptions,
	InitiateAuthNonConfirmedUserSignInOptions,
	InitiateAuthRequest,
	InitiateAuthResponse,
	InitiateAuthSuccessUserSignInOptions,
} from "./initiate-auth.ts";
import {
	initiateAuthHandler,
	initiateAuthNewPasswordRequiredHandlers,
	initiateAuthNonConfirmedUserSignInHandlers,
	initiateAuthSuccessUserSignInHandlers,
} from "./initiate-auth.ts";
import type { ResendConfirmationCodeOptions } from "./resend-confirmation-code.ts";
import resendConfirmationCodeHandler from "./resend-confirmation-code.ts";
import { partial, createCognitoBaseUrl } from "./utils.ts";
import type { SignUpRequest, SignUpResponse } from "./sign-up.ts";
import signUpHandler from "./sign-up.ts";
import type { GetUserOptions } from "./get-user.ts";
import getUserHandler from "./get-user.ts";
import type {
	ConfirmForgotPasswordOptions,
	ForgotPasswordOptions,
} from "./forgot-password.ts";
import {
	confirmForgotPasswordHandler,
	forgotPasswordHandler,
} from "./forgot-password.ts";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
};

// Note: Keep explicit return type. It's something required by JSR
type CognitoHandlersFactory = {
	forgotPasswordHandler: (
		options: ForgotPasswordOptions,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	confirmForgotPasswordHandler: (
		options: ConfirmForgotPasswordOptions,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	changePasswordHandler: (
		options: ChangePasswordOptions,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	initiateAuthNonConfirmedUserSignInHandlers: (
		options: InitiateAuthNonConfirmedUserSignInOptions,
	) => readonly HttpHandler[];
	initiateAuthNewPasswordRequiredHandlers: (
		options: InitiateAuthNewPasswordRequiredOptions,
	) => readonly HttpHandler[];
	initiateAuthSuccessUserSignInHandlers: (
		options: InitiateAuthSuccessUserSignInOptions,
	) => readonly HttpHandler[];
	signUpHandler: (
		request: SignUpRequest,
		response?: SignUpResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	confirmSignUpHandler: (
		request: ConfirmSignUpRequest,
		response?: ConfirmSignUpResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	getUserHandler: (
		options: GetUserOptions,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	resendConfirmationCodeHandler: (
		options: ResendConfirmationCodeOptions,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	initiateAuthHandler: (
		request: InitiateAuthRequest,
		response?: InitiateAuthResponse,
		handlerOptions?: HandlerOptions,
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
		initiateAuthHandler: partial(initiateAuthHandler, builders, baseOptions),
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
