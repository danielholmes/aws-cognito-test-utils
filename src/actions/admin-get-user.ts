import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type AdminGetUserRequest = {
	UserPoolId: string | undefined;
	Username: string | undefined;
};
type AdminGetUserResponse = {
	Username: string | undefined;
	UserAttributes?: AttributeType[] | undefined;
	UserCreateDate?: number | undefined;
	UserLastModifiedDate?: number | undefined;
	Enabled?: boolean | undefined;
	UserStatus?: UserStatusType | undefined;
	MFAOptions?: MFAOptionType[] | undefined;
	PreferredMfaSetting?: string | undefined;
	UserMFASettingList?: string[] | undefined;
};
type AttributeType = {
	Name: string | undefined;
	Value?: string | undefined;
};
declare const UserStatusType: {
	readonly ARCHIVED: "ARCHIVED";
	readonly COMPROMISED: "COMPROMISED";
	readonly CONFIRMED: "CONFIRMED";
	readonly EXTERNAL_PROVIDER: "EXTERNAL_PROVIDER";
	readonly FORCE_CHANGE_PASSWORD: "FORCE_CHANGE_PASSWORD";
	readonly RESET_REQUIRED: "RESET_REQUIRED";
	readonly UNCONFIRMED: "UNCONFIRMED";
	readonly UNKNOWN: "UNKNOWN";
};
type UserStatusType = (typeof UserStatusType)[keyof typeof UserStatusType];
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

function adminGetUserHandler(
	factory: RestHandlersFactory,
	request: AdminGetUserRequest,
	response: AdminGetUserResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.AdminGetUser",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: response,
			},
		},
		handlerOptions,
	);
}

export type { AdminGetUserRequest, AdminGetUserResponse };
export default adminGetUserHandler;
