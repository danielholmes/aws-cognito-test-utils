import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type AdminSetUserPasswordRequest = {
	UserPoolId: string | undefined;
	Username: string | undefined;
	Password: string | undefined;
	Permanent?: boolean | undefined;
};
type AdminSetUserPasswordResponse = {};

function adminSetUserPasswordHandler(
	factory: RestHandlersFactory,
	request: AdminSetUserPasswordRequest,
	response?: AdminSetUserPasswordResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.AdminSetUserPassword",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies AdminSetUserPasswordResponse,
			},
		},
		handlerOptions,
	);
}

export type { AdminSetUserPasswordRequest, AdminSetUserPasswordResponse };
export default adminSetUserPasswordHandler;
