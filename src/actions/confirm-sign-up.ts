import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type ConfirmSignUpRequest = {
	SecretHash?: string | undefined;
	Username: string | undefined;
	ConfirmationCode: string | undefined;
	ForceAliasCreation?: boolean | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	UserContextData?: UserContextDataType | undefined;
	ClientMetadata?: Record<string, string> | undefined;
	Session?: string | undefined;
};
type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};
type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};
type ConfirmSignUpResponse = {
	Session?: string | undefined;
};

function confirmSignUpHandler(
	factory: RestHandlersFactory,
	request: ConfirmSignUpRequest,
	response?: ConfirmSignUpResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.ConfirmSignUp",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies ConfirmSignUpResponse,
			},
		},
		handlerOptions,
	);
}

export type { ConfirmSignUpRequest, ConfirmSignUpResponse };
export default confirmSignUpHandler;
