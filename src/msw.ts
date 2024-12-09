import { createRestHandlersFactory } from "@dhau/msw-builders";
import type { HttpHandler } from "msw";
import type { BaseHandlerOptions, HandlerOptions } from "./create-handler.ts";
import { partial, createCognitoBaseUrl } from "./utils.ts";
import type {
	ChangePasswordRequest,
	ChangePasswordResponse,
} from "./actions/change-password.ts";
import changePasswordHandler from "./actions/change-password.ts";
import type {
	ForgotPasswordRequest,
	ForgotPasswordResponse,
} from "./actions/forgot-password.ts";
import forgotPasswordHandler from "./actions/forgot-password.ts";
import type {
	ConfirmForgotPasswordRequest,
	ConfirmForgotPasswordResponse,
} from "./actions/confirm-forgot-password.ts";
import confirmForgotPasswordHandler from "./actions/confirm-forgot-password.ts";
import type { SignUpRequest, SignUpResponse } from "./actions/sign-up.ts";
import signUpHandler from "./actions/sign-up.ts";
import type {
	ResendConfirmationCodeRequest,
	ResendConfirmationCodeResponse,
} from "./actions/resend-confirmation-code.ts";
import resendConfirmationCodeHandler from "./actions/resend-confirmation-code.ts";
import type { GetUserRequest, GetUserResponse } from "./actions/get-user.ts";
import getUserHandler from "./actions/get-user.ts";
import type {
	ConfirmSignUpRequest,
	ConfirmSignUpResponse,
} from "./actions/confirm-sign-up.ts";
import confirmSignUpHandler from "./actions/confirm-sign-up.ts";
import type {
	InitiateAuthRequest,
	InitiateAuthResponse,
} from "./actions/initiate-auth.ts";
import initiateAuthHandler from "./actions/initiate-auth.ts";

type Options = BaseHandlerOptions & {
	readonly userPoolId: string;
	readonly debug?: boolean;
};

// Note: Keep explicit return type. It's something required by JSR
type CognitoHandlersFactory = {
	forgotPasswordHandler: (
		request: ForgotPasswordRequest,
		response?: ForgotPasswordResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	confirmForgotPasswordHandler: (
		request: ConfirmForgotPasswordRequest,
		response?: ConfirmForgotPasswordResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	changePasswordHandler: (
		request: ChangePasswordRequest,
		response?: ChangePasswordResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	// initiateAuthNonConfirmedUserSignInHandlers: (
	// 	options: InitiateAuthNonConfirmedUserSignInOptions,
	// ) => readonly HttpHandler[];
	// initiateAuthNewPasswordRequiredHandlers: (
	// 	options: InitiateAuthNewPasswordRequiredOptions,
	// ) => readonly HttpHandler[];
	// initiateAuthSuccessUserSignInHandlers: (
	// 	options: InitiateAuthSuccessUserSignInOptions,
	// ) => readonly HttpHandler[];
	signUpHandler: (
		request: SignUpRequest,
		response: SignUpResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	confirmSignUpHandler: (
		request: ConfirmSignUpRequest,
		response?: ConfirmSignUpResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	getUserHandler: (
		request: GetUserRequest,
		response: GetUserResponse,
		handlerOptions?: HandlerOptions,
	) => HttpHandler;
	resendConfirmationCodeHandler: (
		request: ResendConfirmationCodeRequest,
		response?: ResendConfirmationCodeResponse,
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
		initiateAuthHandler: partial(initiateAuthHandler, builders),
		signUpHandler: partial(signUpHandler, builders),
		confirmSignUpHandler: partial(confirmSignUpHandler, builders),
		getUserHandler: partial(getUserHandler, builders),
		resendConfirmationCodeHandler: partial(
			resendConfirmationCodeHandler,
			builders,
		),
	};
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
