import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type AdminDeleteUserRequest = {
	UserPoolId: string | undefined;
	Username: string | undefined;
};

function adminDeleteUserHandler(
	factory: RestHandlersFactory,
	request: AdminDeleteUserRequest,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.AdminDeleteUser",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: undefined,
			},
		},
		handlerOptions,
	);
}

export type { AdminDeleteUserRequest };
export default adminDeleteUserHandler;
