import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type RespondToAuthChallengeRequest = {
	ChallengeName: ChallengeNameType | undefined;
	Session?: string | undefined;
	ChallengeResponses?: Record<string, string> | undefined;
	AnalyticsMetadata?: AnalyticsMetadataType | undefined;
	UserContextData?: UserContextDataType | undefined;
	ClientMetadata?: Record<string, string> | undefined;
};
declare const ChallengeNameType: {
	readonly ADMIN_NO_SRP_AUTH: "ADMIN_NO_SRP_AUTH";
	readonly CUSTOM_CHALLENGE: "CUSTOM_CHALLENGE";
	readonly DEVICE_PASSWORD_VERIFIER: "DEVICE_PASSWORD_VERIFIER";
	readonly DEVICE_SRP_AUTH: "DEVICE_SRP_AUTH";
	readonly EMAIL_OTP: "EMAIL_OTP";
	readonly MFA_SETUP: "MFA_SETUP";
	readonly NEW_PASSWORD_REQUIRED: "NEW_PASSWORD_REQUIRED";
	readonly PASSWORD: "PASSWORD";
	readonly PASSWORD_SRP: "PASSWORD_SRP";
	readonly PASSWORD_VERIFIER: "PASSWORD_VERIFIER";
	readonly SELECT_CHALLENGE: "SELECT_CHALLENGE";
	readonly SELECT_MFA_TYPE: "SELECT_MFA_TYPE";
	readonly SMS_MFA: "SMS_MFA";
	readonly SMS_OTP: "SMS_OTP";
	readonly SOFTWARE_TOKEN_MFA: "SOFTWARE_TOKEN_MFA";
	readonly WEB_AUTHN: "WEB_AUTHN";
};
type ChallengeNameType =
	(typeof ChallengeNameType)[keyof typeof ChallengeNameType];
type AnalyticsMetadataType = {
	AnalyticsEndpointId?: string | undefined;
};
type UserContextDataType = {
	IpAddress?: string | undefined;
	EncodedData?: string | undefined;
};
type RespondToAuthChallengeResponse = {
	ChallengeName?: ChallengeNameType | undefined;
	Session?: string | undefined;
	ChallengeParameters?: Record<string, string> | undefined;
	AuthenticationResult?: AuthenticationResultType | undefined;
};
type AuthenticationResultType = {
	AccessToken?: string | undefined;
	ExpiresIn?: number | undefined;
	TokenType?: string | undefined;
	RefreshToken?: string | undefined;
	IdToken?: string | undefined;
	NewDeviceMetadata?: NewDeviceMetadataType | undefined;
};
type NewDeviceMetadataType = {
	DeviceKey?: string | undefined;
	DeviceGroupKey?: string | undefined;
};

function respondToAuthChallengeHandler(
	factory: RestHandlersFactory,
	request: RespondToAuthChallengeRequest,
	response?: RespondToAuthChallengeResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies RespondToAuthChallengeResponse,
			},
		},
		handlerOptions,
	);
}

export type { RespondToAuthChallengeRequest, RespondToAuthChallengeResponse };
export default respondToAuthChallengeHandler;
