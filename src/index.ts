import { DefaultBodyType, MockedRequest, RestHandler } from "msw";
import { createCognitoPostHandler } from "./create-handler";

type EndpointOptions = {
  readonly region: string;
  readonly userPoolClientId: string;
};

type CognitoHandlersFactory = {
  readonly initiateAuthNewPasswordRequiredHandlers: (
    email: string
  ) => ReadonlyArray<RestHandler<MockedRequest<DefaultBodyType>>>;
};

function createCognitoHandlersFactory(
  baseOptions: EndpointOptions
): CognitoHandlersFactory {
  return {
    initiateAuthNewPasswordRequiredHandlers(email: string) {
      return [
        createCognitoPostHandler({
          ...baseOptions,
          target: "AWSCognitoIdentityProviderService.InitiateAuth",
          // TODO: Don't know what to check for pw
          bodyMatcher: {
            AuthFlow: "USER_SRP_AUTH",
            AuthParameters: {
              USERNAME: email,
            },
          },
          successResponse: {
            ChallengeName: "PASSWORD_VERIFIER",
            ChallengeParameters: {
              SALT: "salt123",
              SECRET_BLOCK: "secretBlock",
              SRP_B: "srpB",
              USERNAME: "newUsername",
              USER_ID_FOR_SRP: "newUsername",
            },
          },
        }),
        createCognitoPostHandler({
          ...baseOptions,
          target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
          bodyMatcher: {
            ChallengeName: "PASSWORD_VERIFIER",
            ChallengeResponses: {
              USERNAME: "newUsername",
            },
          },
          successResponse: {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeParameters: {
              requiredAttributes: "[]",
              userAttributes: JSON.stringify({
                email_verified: "true",
                email,
              }),
              Session: `session${Math.random()}`,
            },
          },
        }),
      ];
    },
  };
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
