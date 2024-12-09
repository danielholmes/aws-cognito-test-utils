import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type SignUpRequest = {
	SecretHash?: string | undefined;
	Username: string | undefined;
	Password?: string | undefined;
	UserAttributes?: AttributeType[] | undefined;
	ValidationData?: AttributeType[] | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	UserContextData?: UserContextDataType | undefined;
	ClientMetadata?: Record<string, string> | undefined;
};
type AttributeType = {
	Name: string | undefined;
	Value?: string | undefined;
};
type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};
type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};
type SignUpResponse = {
	UserConfirmed: boolean | undefined;
	CodeDeliveryDetails?: CodeDeliveryDetailsType | undefined;
	UserSub: string | undefined;
	Session?: string | undefined;
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

function signUpHandler(
	factory: RestHandlersFactory,
	request: SignUpRequest,
	response: SignUpResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.SignUp",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: response,
			},
		},
		handlerOptions,
	);
}

export type { SignUpRequest, SignUpResponse };
export default signUpHandler;
