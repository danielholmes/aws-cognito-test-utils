import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type GetUserRequest = {
	AccessToken: string | undefined;
};
type GetUserResponse = {
	Username: string | undefined;
	UserAttributes: AttributeType[] | undefined;
	MFAOptions?: MFAOptionType[] | undefined;
	PreferredMfaSetting?: string | undefined;
	UserMFASettingList?: string[] | undefined;
};
type AttributeType = {
	Name: string | undefined;
	Value?: string | undefined;
};
type MFAOptionType = {
	DeliveryMedium?: DeliveryMediumType | undefined;
	AttributeName?: string | undefined;
};
declare const DeliveryMediumType: {
	readonly EMAIL: "EMAIL";
	readonly SMS: "SMS";
};
type DeliveryMediumType =
	(typeof DeliveryMediumType)[keyof typeof DeliveryMediumType];

function getUserHandler(
	factory: RestHandlersFactory,
	request: GetUserRequest,
	response: GetUserResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.GetUser",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: response,
			},
		},
		handlerOptions,
	);
}

export type { GetUserRequest, GetUserResponse };
export default getUserHandler;
