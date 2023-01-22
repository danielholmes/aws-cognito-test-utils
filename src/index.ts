import { omit, partial } from "lodash-es";
import changePasswordHandler from "./change-password";
import confirmSignUpHandler from "./confirm-sign-up";
import { BaseEndpointOptions } from "./create-handler";
import {
  initiateAuthNewPasswordRequiredHandlers,
  initiateAuthNonConfirmedUserSignInHandlers,
} from "./initiate-auth";
import resendConfirmationCodeHandler from "./resend-confirmation-code";

function createCognitoHandlersFactory(baseOptions: BaseEndpointOptions) {
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

type CognitoHandlersFactory = ReturnType<typeof createCognitoHandlersFactory>;

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
