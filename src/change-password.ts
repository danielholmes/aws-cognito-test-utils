import { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "./utils.ts";
import { HandlerOptions, createCognitoPostHandler } from "./create-handler.ts";

type ChangePasswordOptions = {
	readonly previousPassword: string;
	readonly proposedPassword: string;
	readonly accessToken: string;
	readonly clientMetadata?: Record<string, string>;
};

function changePasswordHandler(
	factory: RestHandlersFactory,
	{
		previousPassword,
		proposedPassword,
		accessToken,
		clientMetadata,
		...rest
	}: ChangePasswordOptions,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			...rest,
			target: "AWSCognitoIdentityProviderService.ChangePassword",
			bodyMatcher: (b) =>
				isMatch(b, {
					PreviousPassword: previousPassword,
					ProposedPassword: proposedPassword,
					AccessToken: accessToken,
					...(clientMetadata ? { ClientMetadata: clientMetadata } : {}),
				}),
			matchResponse: {
				status: 200,
				body: {},
			},
		},
		handlerOptions,
	);
}

export type { ChangePasswordOptions };
export default changePasswordHandler;
