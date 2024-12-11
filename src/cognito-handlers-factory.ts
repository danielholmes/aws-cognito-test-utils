// Note: Keep explicit return type. It's something required by JSR
import type { HttpHandler } from "msw";
import type { HandlerOptions } from "./create-handler.ts";
import type { UserTokens } from "./tokens/types.ts";
import type {
	GenerateCognitoUserTokensOptions,
	User,
} from "./tokens/generate.ts";
import type {
	InitiateAuthSrpNonConfirmedOptions,
	InitiateAuthSrpSuccessOptions,
	InitiateAuthSrpNewPasswordOptions,
	InitiateAuthSrpTotpOptions,
} from "./facades/initiate-auth-srp.ts";
import type {
	ChangePasswordRequest,
	ChangePasswordResponse,
} from "./actions/change-password.ts";
import type {
	ForgotPasswordRequest,
	ForgotPasswordResponse,
} from "./actions/forgot-password.ts";
import type {
	ConfirmForgotPasswordRequest,
	ConfirmForgotPasswordResponse,
} from "./actions/confirm-forgot-password.ts";
import type {
	ConfirmSignUpRequest,
	ConfirmSignUpResponse,
} from "./actions/confirm-sign-up.ts";
import type { GetUserRequest, GetUserResponse } from "./actions/get-user.ts";
import type {
	ResendConfirmationCodeRequest,
	ResendConfirmationCodeResponse,
} from "./actions/resend-confirmation-code.ts";
import type { SignUpRequest, SignUpResponse } from "./actions/sign-up.ts";
import type {
	InitiateAuthRequest,
	InitiateAuthResponse,
} from "./actions/initiate-auth.ts";
import type {
	RespondToAuthChallengeRequest,
	RespondToAuthChallengeResponse,
} from "./actions/respond-to-auth-challenge.ts";
import type {
	AssociateSoftwareTokenRequest,
	AssociateSoftwareTokenResponse,
} from "./actions/associate-software-token.ts";
import type {
	VerifySoftwareTokenRequest,
	VerifySoftwareTokenResponse,
} from "./actions/verify-software-token.ts";
import type {
	SetUserMFAPreferenceRequest,
	SetUserMFAPreferenceResponse,
} from "./actions/set-user-mfapreference.ts";
type CognitoHandlersFactory = {
	generateUserTokens(
		user: User,
		options?: GenerateCognitoUserTokensOptions,
	): UserTokens;
	wellKnownJwksHandler(): HttpHandler;

	initiateAuthSrpSuccessHandlers(
		options: InitiateAuthSrpSuccessOptions,
	): readonly HttpHandler[];
	initiateAuthSrpTotpHandlers(
		options: InitiateAuthSrpTotpOptions,
	): readonly HttpHandler[];
	initiateAuthSrpNewPasswordHandlers(
		options: InitiateAuthSrpNewPasswordOptions,
	): readonly HttpHandler[];
	initiateAuthSrpNonConfirmedHandlers(
		options: InitiateAuthSrpNonConfirmedOptions,
	): readonly HttpHandler[];

	changePasswordHandler(
		request: ChangePasswordRequest,
		response?: ChangePasswordResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	forgotPasswordHandler(
		request: ForgotPasswordRequest,
		response?: ForgotPasswordResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	confirmForgotPasswordHandler(
		request: ConfirmForgotPasswordRequest,
		response?: ConfirmForgotPasswordResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	confirmSignUpHandler(
		request: ConfirmSignUpRequest,
		response?: ConfirmSignUpResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	getUserHandler(
		request: GetUserRequest,
		response: GetUserResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	resendConfirmationCodeHandler(
		request: ResendConfirmationCodeRequest,
		response?: ResendConfirmationCodeResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	signUpHandler(
		request: SignUpRequest,
		response: SignUpResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	initiateAuthHandler(
		request: InitiateAuthRequest,
		response?: InitiateAuthResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	respondToAuthChallengeHandler(
		request: RespondToAuthChallengeRequest,
		response?: RespondToAuthChallengeResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	associateSoftwareTokenHandler(
		request: AssociateSoftwareTokenRequest,
		response?: AssociateSoftwareTokenResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	verifySoftwareTokenHandler(
		request: VerifySoftwareTokenRequest,
		response?: VerifySoftwareTokenResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
	setUserMFAPreferenceHandler(
		request: SetUserMFAPreferenceRequest,
		response?: SetUserMFAPreferenceResponse,
		handlerOptions?: HandlerOptions,
	): HttpHandler;
};
export type { CognitoHandlersFactory };
