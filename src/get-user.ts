import { isEqual, uniqueId } from "lodash-es";
import { RestHandlersFactory } from "@dhau/msw-builders";
import {
	CognitoPostOptions,
	BaseHandlerOptions,
	createCognitoPostHandler,
} from "./create-handler";

type GetUserOptions = Pick<CognitoPostOptions, "onCalled"> & {
	readonly accessToken?: string;
	readonly username?: string;
	readonly userAttributes?: Record<string, string>;
};

function getUserHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ accessToken, username, userAttributes, ...rest }: GetUserOptions,
) {
	return createCognitoPostHandler(factory, {
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
	});
}

export type { GetUserOptions };
export default getUserHandler;
