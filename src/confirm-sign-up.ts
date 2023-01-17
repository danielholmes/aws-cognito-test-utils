import {
  BaseEndpointOptions,
  CognitoPostOptions,
  createCognitoPostHandler,
} from "./create-handler";

type ConfirmSignUpOptions = Pick<CognitoPostOptions, "onCalled"> & {
  readonly username: string;
  readonly code: string;
};

function confirmSignUpHandler(
  baseOptions: BaseEndpointOptions,
  { username, code, ...rest }: ConfirmSignUpOptions
) {
  return createCognitoPostHandler({
    ...baseOptions,
    ...rest,
    target: "AWSCognitoIdentityProviderService.ConfirmSignUp",
    bodyMatcher: {
      Username: username,
      ConfirmationCode: code,
    },
    matchResponse: {
      status: 200,
      body: {},
    },
  });
}

export type { ConfirmSignUpOptions };
export default confirmSignUpHandler;
