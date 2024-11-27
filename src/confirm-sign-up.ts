import { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import {
	BaseHandlerOptions,
	createCognitoPostHandler,
	HandlerOptions,
} from "./create-handler.ts";

type ConfirmSignUpOptions = {
	readonly username: string;
	readonly code: string;
};

function confirmSignUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, code, ...rest }: ConfirmSignUpOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...baseOptions,
			...rest,
			target: "AWSCognitoIdentityProviderService.ConfirmSignUp",
			bodyMatcher: (b) =>
				isMatch(b, {
					Username: username,
					ConfirmationCode: code,
				}),
			matchResponse: {
				status: 200,
				body: {},
			},
		},
		handlerOptions,
	);
}

export type { ConfirmSignUpOptions };
export default confirmSignUpHandler;
