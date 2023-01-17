import {
  BaseEndpointOptions,
  createCognitoPostHandler,
} from "./create-handler";

type InitiateAuthNewPasswordRequiredOptions = {
  readonly email: string;
};

function initiateAuthNewPasswordRequiredHandlers(
  baseOptions: BaseEndpointOptions,
  { email }: InitiateAuthNewPasswordRequiredOptions
) {
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
      matchResponse: {
        status: 200,
        body: {
          ChallengeName: "PASSWORD_VERIFIER",
          ChallengeParameters: {
            SALT: "salt123",
            SECRET_BLOCK: "secretBlock",
            SRP_B: "srpB",
            USERNAME: "newUsername",
            USER_ID_FOR_SRP: "newUsername",
          },
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
      matchResponse: {
        status: 200,
        body: {
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
      },
    }),
  ];
}

type initiateAuthNonConfirmedUserSignInHandlers = {
  readonly username: string;
};

function initiateAuthNonConfirmedUserSignInHandlers(
  baseOptions: BaseEndpointOptions,
  { username }: initiateAuthNonConfirmedUserSignInHandlers
) {
  return [
    createCognitoPostHandler({
      ...baseOptions,
      target: "AWSCognitoIdentityProviderService.InitiateAuth",
      bodyMatcher: {
        AuthFlow: "USER_SRP_AUTH",
        AuthParameters: {
          USERNAME: username,
        },
      },
      matchResponse: {
        status: 200,
        body: {
          ChallengeName: "PASSWORD_VERIFIER",
          ChallengeParameters: {
            SALT: "salt123",
            SECRET_BLOCK: "secretBlock",
            SRP_B: "srpB",
            USERNAME: "newUsername",
            USER_ID_FOR_SRP: "newUsername",
          },
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
      matchResponse: {
        status: 400,
        body: {
          __type: "UserNotConfirmedException",
          message: "User is not confirmed.",
        },
      },
    }),
  ];
}

export type { InitiateAuthNewPasswordRequiredOptions, c };
export {
  initiateAuthNonConfirmedUserSignInHandlers,
  initiateAuthNewPasswordRequiredHandlers,
};
