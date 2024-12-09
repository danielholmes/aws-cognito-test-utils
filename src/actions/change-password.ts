import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type ChangePasswordRequest = {
	PreviousPassword?: string | undefined;
	ProposedPassword: string | undefined;
	AccessToken: string | undefined;
};
type ChangePasswordResponse = {};

function changePasswordHandler(
	factory: RestHandlersFactory,
	request: ChangePasswordRequest,
	response?: ChangePasswordResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.ChangePassword",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies ChangePasswordResponse,
			},
		},
		handlerOptions,
	);
}

export type { ChangePasswordRequest, ChangePasswordResponse };
export default changePasswordHandler;
