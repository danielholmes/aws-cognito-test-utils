import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type ResendConfirmationCodeRequest = {
	SecretHash?: string | undefined;
	UserContextData?: UserContextDataType | undefined;
	Username: string | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	ClientMetadata?: Record<string, string> | undefined;
};
type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};
type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};
type ResendConfirmationCodeResponse = {
	CodeDeliveryDetails?: CodeDeliveryDetailsType | undefined;
};
type CodeDeliveryDetailsType = {
	Destination?: string | undefined;
	DeliveryMedium?: DeliveryMediumType | undefined;
	AttributeName?: string | undefined;
};
declare const DeliveryMediumType: {
	readonly EMAIL: "EMAIL";
	readonly SMS: "SMS";
};
type DeliveryMediumType =
	(typeof DeliveryMediumType)[keyof typeof DeliveryMediumType];

function resendConfirmationCodeHandler(
	factory: RestHandlersFactory,
	request: ResendConfirmationCodeRequest,
	response?: ResendConfirmationCodeResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.ResendConfirmationCode",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies ResendConfirmationCodeResponse,
			},
		},
		handlerOptions,
	);
}

export type { ResendConfirmationCodeRequest, ResendConfirmationCodeResponse };
export default resendConfirmationCodeHandler;
