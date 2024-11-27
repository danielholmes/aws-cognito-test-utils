import { RestHandlersFactory } from "@dhau/msw-builders";
import { isEqual, uniqueId } from "./utils.ts";
import {
	BaseHandlerOptions,
	HandlerOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type GetUserOptions = {
	readonly accessToken?: string;
	readonly username?: string;
	readonly userAttributes?: Record<string, string>;
};

function getUserHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ accessToken, username, userAttributes, ...rest }: GetUserOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...baseOptions,
			...rest,
			target: "AWSCognitoIdentityProviderService.GetUser",
			bodyMatcher: (b) =>
				!accessToken ||
				isEqual(b, {
					AccessToken: accessToken,
				}),
			matchResponse: {
				status: 200,
				body: {
					UserAttributes: Object.entries(userAttributes ?? {}).map(
						([Name, Value]) => ({
							Name,
							Value,
						}),
					),
					Username: username ?? uniqueId(),
				},
			},
		},
		handlerOptions,
	);
}

export type { GetUserOptions };
export default getUserHandler;
