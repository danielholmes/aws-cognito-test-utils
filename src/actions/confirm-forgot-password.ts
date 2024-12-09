import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type ConfirmForgotPasswordRequest = {
	SecretHash?: string | undefined;
	Username: string | undefined;
	ConfirmationCode: string | undefined;
	Password: string | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	UserContextData?: UserContextDataType | undefined;
	ClientMetadata?: Record<string, string> | undefined;
};
type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};
type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};
type ConfirmForgotPasswordResponse = {};

function confirmForgotPasswordHandler(
	factory: RestHandlersFactory,
	request: ConfirmForgotPasswordRequest,
	response?: ConfirmForgotPasswordResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.ConfirmForgotPassword",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies ConfirmForgotPasswordResponse,
			},
		},
		handlerOptions,
	);
}

export type { ConfirmForgotPasswordRequest, ConfirmForgotPasswordResponse };
export default confirmForgotPasswordHandler;
