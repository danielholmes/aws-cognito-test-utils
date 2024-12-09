import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type VerifySoftwareTokenRequest = {
	AccessToken?: string | undefined;
	Session?: string | undefined;
	UserCode: string | undefined;
	FriendlyDeviceName?: string | undefined;
};
type VerifySoftwareTokenResponse = {
	Status?: VerifySoftwareTokenResponseType | undefined;
	Session?: string | undefined;
};
declare const VerifySoftwareTokenResponseType: {
	readonly ERROR: "ERROR";
	readonly SUCCESS: "SUCCESS";
};
type VerifySoftwareTokenResponseType =
	(typeof VerifySoftwareTokenResponseType)[keyof typeof VerifySoftwareTokenResponseType];

function verifySoftwareTokenHandler(
	factory: RestHandlersFactory,
	request: VerifySoftwareTokenRequest,
	response?: VerifySoftwareTokenResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.VerifySoftwareToken",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies VerifySoftwareTokenResponse,
			},
		},
		handlerOptions,
	);
}

export type { VerifySoftwareTokenRequest, VerifySoftwareTokenResponse };
export default verifySoftwareTokenHandler;
