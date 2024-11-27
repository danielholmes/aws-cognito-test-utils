import { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import {
	BaseHandlerOptions,
	HandlerOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type ResendConfirmationCodeOptions = {
	readonly username: string;
};

function resendConfirmationCodeHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, ...rest }: ResendConfirmationCodeOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...baseOptions,
			...rest,
			target: "AWSCognitoIdentityProviderService.ResendConfirmationCode",
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

export type { ResendConfirmationCodeOptions };
export default resendConfirmationCodeHandler;
