import type { RestHandlersFactory } from "@dhau/msw-builders";
import { isMatch } from "../utils.ts";
import type { HandlerOptions } from "../create-handler.ts";
import { createCognitoPostHandler } from "../create-handler.ts";

type SetUserMFAPreferenceRequest = {
	SMSMfaSettings?: SMSMfaSettingsType | undefined;
	SoftwareTokenMfaSettings?: SoftwareTokenMfaSettingsType | undefined;
	EmailMfaSettings?: EmailMfaSettingsType | undefined;
	AccessToken: string | undefined;
};
type SMSMfaSettingsType = {
	Enabled?: boolean | undefined;
	PreferredMfa?: boolean | undefined;
};
type SoftwareTokenMfaSettingsType = {
	Enabled?: boolean | undefined;
	PreferredMfa?: boolean | undefined;
};
type EmailMfaSettingsType = {
	Enabled?: boolean | undefined;
	PreferredMfa?: boolean | undefined;
};
type SetUserMFAPreferenceResponse = {};

function setUserMFAPreferenceHandler(
	factory: RestHandlersFactory,
	request: SetUserMFAPreferenceRequest,
	response?: SetUserMFAPreferenceResponse,
	handlerOptions?: HandlerOptions,
) {
	return createCognitoPostHandler(
		factory,
		{
			target: "AWSCognitoIdentityProviderService.SetUserMFAPreference",
			bodyMatcher: (b) => isMatch(b, request),
			matchResponse: {
				status: 200,
				body: (response ?? {}) satisfies SetUserMFAPreferenceResponse,
			},
		},
		handlerOptions,
	);
}

export type { SetUserMFAPreferenceRequest, SetUserMFAPreferenceResponse };
export default setUserMFAPreferenceHandler;
