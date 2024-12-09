import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type AssociateSoftwareTokenRequest = {
	AccessToken?: string | undefined;
	Session?: string | undefined;
};
type AssociateSoftwareTokenResponse = {
	SecretCode?: string | undefined;
	Session?: string | undefined;
};

function associateSoftwareTokenHandler(
	factory: RestHandlersFactory,
	request: AssociateSoftwareTokenRequest,
	response?: AssociateSoftwareTokenResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.AssociateSoftwareToken",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies AssociateSoftwareTokenResponse,
			},
		},
		handlerOptions,
	);
}

export type { AssociateSoftwareTokenRequest, AssociateSoftwareTokenResponse };
export default associateSoftwareTokenHandler;
