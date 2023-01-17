import {
  BaseEndpointOptions,
  CognitoPostOptions,
  createCognitoPostHandler,
} from "./create-handler";

type ResendConfirmationCodeOptions = Pick<CognitoPostOptions, "onCalled"> & {
  readonly username: string;
};

function resendConfirmationCodeHandler(
  baseOptions: BaseEndpointOptions,
  { username, ...rest }: ResendConfirmationCodeOptions
) {
  return createCognitoPostHandler({
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
