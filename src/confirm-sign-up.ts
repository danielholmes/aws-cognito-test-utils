import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import type { BaseHandlerOptions, HandlerOptions } from "./create-handler.ts";
import { createCognitoPostHandler } from "./create-handler.ts";

type ConfirmSignUpRequest = {
	readonly Username: string;
	readonly ConfirmationCode: string;
	readonly Session?: string;
};

type ConfirmSignUpResponse = {
	readonly Session?: string;
};

function confirmSignUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	request: ConfirmSignUpRequest,
	response?: ConfirmSignUpResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...baseOptions,
			target: "AWSCognitoIdentityProviderService.ConfirmSignUp",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: response ?? ({} satisfies ConfirmSignUpResponse),
			},
		},
		handlerOptions,
	);
}

export type { ConfirmSignUpRequest, ConfirmSignUpResponse };
export default confirmSignUpHandler;
