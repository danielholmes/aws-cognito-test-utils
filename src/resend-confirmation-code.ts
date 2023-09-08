import { RestHandlersFactory } from "@dhau/msw-builders";
import {
	BaseHandlerOptions,
	CognitoPostOptions,
	createCognitoPostHandler,
} from "./create-handler";

type ResendConfirmationCodeOptions = Pick<CognitoPostOptions, "onCalled"> & {
	readonly username: string;
};

function resendConfirmationCodeHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, ...rest }: ResendConfirmationCodeOptions,
) {
	return createCognitoPostHandler(factory, {
		...baseOptions,
		...rest,
		target: "AWSCognitoIdentityProviderService.ResendConfirmationCode",
		bodyMatcher: {
			Username: username,
		},
		matchResponse: {
			status: 200,
			body: {},
		},
	});
}

export type { ResendConfirmationCodeOptions };
export default resendConfirmationCodeHandler;
