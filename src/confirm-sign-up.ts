import isMatch from "lodash-es/isMatch.js";
import { RestHandlersFactory } from "@dhau/msw-builders";
import {
	CognitoPostOptions,
	BaseHandlerOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type ConfirmSignUpOptions = Pick<CognitoPostOptions, "onCalled"> & {
	readonly username: string;
	readonly code: string;
};

function confirmSignUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, code, ...rest }: ConfirmSignUpOptions,
) {
	return createCognitoPostHandler(factory, {
		...baseOptions,
		...rest,
		target: "AWSCognitoIdentityProviderService.ConfirmSignUp",
		bodyMatcher: (b) =>
			isMatch(b, {
				Username: username,
				ConfirmationCode: code,
			}),
		matchResponse: {
			status: 200,
			body: {},
		},
	});
}

export type { ConfirmSignUpOptions };
export default confirmSignUpHandler;
