import type { SignUpResponse } from "@aws-sdk/client-cognito-identity-provider";
import type { RestHandlersFactory } from "@dhau/msw-builders";
import type { HandlerOptions, BaseHandlerOptions } from "./create-handler.ts";
import { createCognitoPostHandler } from "./create-handler.ts";
import { isMatch, uniqueId } from "./utils.ts";

type CognitoUserAttribute = {
	readonly Name: string;
	readonly Value: string;
};

type SignUpOptions = {
	readonly username: string;
	readonly password: string;
	readonly userAttributes?: Record<string, string>;
};

function signUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, password, userAttributes, ...rest }: SignUpOptions,
	response: SignUpResponse | undefined,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
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
				body:
					response ??
					({
						CodeDeliveryDetails: {
							AttributeName: "email",
							DeliveryMedium: "EMAIL",
							// TODO: Derive from input
							Destination: "d***@l***",
						},
						UserConfirmed: false,
						UserSub: uniqueId(),
						Session: uniqueId(),
					} satisfies SignUpResponse),
			},
		},
		handlerOptions,
	);
}

export type { SignUpOptions };
export default signUpHandler;
