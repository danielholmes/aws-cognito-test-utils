import { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import { HandlerOptions, createCognitoPostHandler } from "./create-handler.ts";

type ForgotPasswordOptions = {
	readonly username: string;
};

function forgotPasswordHandler(
	factory: RestHandlersFactory,
	{ username, ...rest }: ForgotPasswordOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...rest,
			target: "AWSCognitoIdentityProviderService.ForgotPassword",
			bodyMatcher: (b) =>
				isMatch(b, {
					Username: username,
				}),
			matchResponse: {
				status: 200,
				body: {},
			},
		},
		handlerOptions,
	);
}

type ConfirmForgotPasswordOptions = {
	readonly username: string;
	readonly verificationCode: string;
	readonly password: string;
};

function confirmForgotPasswordHandler(
	factory: RestHandlersFactory,
	{
		username,
		verificationCode,
		password,
		...rest
	}: ConfirmForgotPasswordOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...rest,
			target: "AWSCognitoIdentityProviderService.ConfirmForgotPassword",
			bodyMatcher: (b) =>
				isMatch(b, {
					Username: username,
					ConfirmationCode: verificationCode,
					Password: password,
				}),
			matchResponse: {
				status: 200,
				body: {},
			},
		},
		handlerOptions,
	);
}

export type { ForgotPasswordOptions, ConfirmForgotPasswordOptions };
export { forgotPasswordHandler, confirmForgotPasswordHandler };
