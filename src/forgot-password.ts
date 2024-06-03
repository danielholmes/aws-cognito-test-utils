import { isMatch } from "lodash-es";
import { RestHandlersFactory } from "@dhau/msw-builders";
import {
	CognitoPostOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type ForgotPasswordOptions = Pick<CognitoPostOptions, "onCalled"> & {
	readonly username: string;
};

function forgotPasswordHandler(
	factory: RestHandlersFactory,
	{ username, ...rest }: ForgotPasswordOptions,
) {
	return createCognitoPostHandler(factory, {
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
	});
}

type ConfirmForgotPasswordOptions = Pick<CognitoPostOptions, "onCalled"> & {
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
) {
	return createCognitoPostHandler(factory, {
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
	});
}

export { forgotPasswordHandler, confirmForgotPasswordHandler };
