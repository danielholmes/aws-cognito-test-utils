import {
  BaseEndpointOptions,
  CognitoPostOptions,
  createCognitoPostHandler,
} from "./create-handler";

type ChangePasswordOptions = Pick<CognitoPostOptions, "onCalled"> & {
  readonly previousPassword: string;
  readonly proposedPassword: string;
  readonly accessToken: string;
};

function changePasswordHandler(
  baseOptions: Omit<BaseEndpointOptions, "userPoolClientId">,
  {
    previousPassword,
    proposedPassword,
    accessToken,
    ...rest
  }: ChangePasswordOptions
) {
  return createCognitoPostHandler({
    ...baseOptions,
    ...rest,
    target: "AWSCognitoIdentityProviderService.ChangePassword",
    bodyMatcher: {
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
      AccessToken: accessToken,
    },
    matchResponse: {
      status: 200,
      body: {},
    },
  });
}

export type { ChangePasswordOptions };
export default changePasswordHandler;
