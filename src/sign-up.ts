import type { RestHandlersFactory } from "@dhau/msw-builders";
import type { HandlerOptions, BaseHandlerOptions } from "./create-handler.ts";
import { createCognitoPostHandler } from "./create-handler.ts";
import { isMatch, uniqueId } from "./utils.ts";

type CognitoUserAttribute = {
	readonly Name: string;
	readonly Value: string;
};

type SignUpRequest = {
	readonly username: string;
	readonly password: string;
	readonly userAttributes?: Record<string, string>;
};

// Copied from sdk cognito-identity-provider so don't need dep
// installation.
type DeliveryMediumType = "EMAIL" | "SMS";

type CodeDeliveryDetailsType = {
	Destination?: string | undefined;
	DeliveryMedium?: DeliveryMediumType | undefined;
	AttributeName?: string | undefined;
};

type SignUpResponse = {
	UserConfirmed: boolean | undefined;
	CodeDeliveryDetails?: CodeDeliveryDetailsType | undefined;
	UserSub: string | undefined;
	Session?: string | undefined;
};

function signUpHandler(
	factory: RestHandlersFactory,
	baseOptions: BaseHandlerOptions,
	{ username, password, userAttributes, ...rest }: SignUpRequest,
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

export type { SignUpRequest, SignUpResponse };
export default signUpHandler;
