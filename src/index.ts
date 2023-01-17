import { partial } from "lodash-es";
import { DefaultBodyType, MockedRequest, RestHandler } from "msw";
import confirmSignUpHandler, { ConfirmSignUpOptions } from "./confirm-sign-up";
import { BaseEndpointOptions } from "./create-handler";
import {
  initiateAuthNewPasswordRequiredHandlers,
  InitiateAuthNewPasswordRequiredOptions,
} from "./initiate-auth";
import resendConfirmationCodeHandler, {
  ResendConfirmationCodeOptions,
} from "./resend-confirmation-code";

type Handler = RestHandler<MockedRequest<DefaultBodyType>>;

type CognitoHandlersFactory = {
  readonly confirmSignUpHandler: (options: ConfirmSignUpOptions) => Handler;
  readonly resendConfirmationCodeHandler: (
    options: ResendConfirmationCodeOptions
  ) => Handler;
  readonly initiateAuthNewPasswordRequiredHandlers: (
    options: InitiateAuthNewPasswordRequiredOptions
  ) => ReadonlyArray<Handler>;
};

function createCognitoHandlersFactory(
  baseOptions: BaseEndpointOptions
): CognitoHandlersFactory {
  return {
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
