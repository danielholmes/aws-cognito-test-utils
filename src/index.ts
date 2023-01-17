import { omit, partial } from "lodash-es";
import { DefaultBodyType, MockedRequest, RestHandler } from "msw";
import changePasswordHandler, {
  ChangePasswordOptions,
} from "./change-password";
import confirmSignUpHandler, { ConfirmSignUpOptions } from "./confirm-sign-up";
import { BaseEndpointOptions } from "./create-handler";
import {
  initiateAuthNewPasswordRequiredHandlers,
  InitiateAuthNewPasswordRequiredOptions,
  InitiateAuthNonConfirmedUserSignInHandlers,
  initiateAuthNonConfirmedUserSignInHandlers,
} from "./initiate-auth";
import resendConfirmationCodeHandler, {
  ResendConfirmationCodeOptions,
} from "./resend-confirmation-code";

type Handler = RestHandler<MockedRequest<DefaultBodyType>>;

type CognitoHandlersFactory = {
  readonly changePasswordHandler: (options: ChangePasswordOptions) => Handler;
  readonly confirmSignUpHandler: (options: ConfirmSignUpOptions) => Handler;
  readonly resendConfirmationCodeHandler: (
    options: ResendConfirmationCodeOptions
  ) => Handler;
  readonly initiateAuthNonConfirmedUserSignInHandlers: (
    options: InitiateAuthNonConfirmedUserSignInHandlers
  ) => ReadonlyArray<Handler>;
  readonly initiateAuthNewPasswordRequiredHandlers: (
    options: InitiateAuthNewPasswordRequiredOptions
  ) => ReadonlyArray<Handler>;
};

function createCognitoHandlersFactory(
  baseOptions: BaseEndpointOptions
): CognitoHandlersFactory {
  return {
    changePasswordHandler: partial(
      changePasswordHandler,
      omit(baseOptions, "userPoolClientId")
    ),
    initiateAuthNonConfirmedUserSignInHandlers: partial(
      initiateAuthNonConfirmedUserSignInHandlers,
      baseOptions
    ),
    initiateAuthNewPasswordRequiredHandlers: partial(
      initiateAuthNewPasswordRequiredHandlers,
      baseOptions
    ),
    confirmSignUpHandler: partial(confirmSignUpHandler, baseOptions),
    resendConfirmationCodeHandler: partial(
      resendConfirmationCodeHandler,
      baseOptions
    ),
  };
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
