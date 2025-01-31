import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type ListUsersRequest = {
	UserPoolId: string | undefined;
	AttributesToGet?: string[] | undefined;
	Limit?: number | undefined;
	PaginationToken?: string | undefined;
	Filter?: string | undefined;
};
type ListUsersResponse = {
	Users?: UserType[] | undefined;
	PaginationToken?: string | undefined;
};
type UserType = {
	Username?: string | undefined;
	Attributes?: AttributeType[] | undefined;
	UserCreateDate?: number | undefined;
	UserLastModifiedDate?: number | undefined;
	Enabled?: boolean | undefined;
	UserStatus?: UserStatusType | undefined;
	MFAOptions?: MFAOptionType[] | undefined;
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

function listUsersHandler(
	factory: RestHandlersFactory,
	request: ListUsersRequest,
	response?: ListUsersResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.ListUsers",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies ListUsersResponse,
			},
		},
		handlerOptions,
	);
}

export type { ListUsersRequest, ListUsersResponse };
export default listUsersHandler;
