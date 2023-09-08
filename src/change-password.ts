import { RestHandlersFactory } from "@dhau/msw-builders";
import { CognitoPostOptions, createCognitoPostHandler } from "./create-handler";

type ChangePasswordOptions = Pick<CognitoPostOptions, "onCalled"> & {
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
) {
	return createCognitoPostHandler(factory, {
		...rest,
		target: "AWSCognitoIdentityProviderService.ChangePassword",
		bodyMatcher: {
			PreviousPassword: previousPassword,
			ProposedPassword: proposedPassword,
			AccessToken: accessToken,
			ClientMetadata: clientMetadata,
		},
		matchResponse: {
			status: 200,
			body: {},
		},
	});
}

export type { ChangePasswordOptions };
export default changePasswordHandler;
