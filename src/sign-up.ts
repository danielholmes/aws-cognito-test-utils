import { isMatch, uniqueId } from "lodash-es";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { RestHandlersFactory } from "@dhau/msw-builders";
import {
	CognitoPostOptions,
	BaseHandlerOptions,
	createCognitoPostHandler,
} from "./create-handler.ts";

type SignUpOptions = Pick<CognitoPostOptions, "onCalled"> & {
	readonly username: string;
	readonly password: string;
	readonly userAttributes?: Record<string, string>;
};

function signUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, password, userAttributes, ...rest }: SignUpOptions,
) {
	return createCognitoPostHandler(factory, {
		...baseOptions,
		...rest,
		target: "AWSCognitoIdentityProviderService.SignUp",
		bodyMatcher: (b) =>
			isMatch(b, {
				Username: username,
				Password: password,
			}) &&
			(!userAttributes ||
				isMatch(
					Object.fromEntries(
						(b.UserAttributes as CognitoUserAttribute[] | undefined)?.map(
							(a) => [a.Name, a.Value],
						) ?? [],
					),
					userAttributes,
				)),
		matchResponse: {
			status: 200,
			body: {
				CodeDeliveryDetails: {
					AttributeName: "email",
					DeliveryMedium: "EMAIL",
					// TODO: Derive from input
					Destination: "d***@l***",
				},
				UserConfirmed: false,
				UserSub: uniqueId(),
				// UserSub: "915c343b-2778-4bc6-bbc1-8fa9a14c619b"
			},
		},
	});
}

export type { SignUpOptions };
export default signUpHandler;
