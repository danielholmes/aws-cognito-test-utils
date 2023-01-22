import { createRestHandlersFactory } from "@dhau/msw-builders";
import { partial } from "lodash-es";
import changePasswordHandler from "./change-password";
import confirmSignUpHandler from "./confirm-sign-up";
import { BaseHandlerOptions } from "./create-handler";
import {
  initiateAuthNewPasswordRequiredHandlers,
  initiateAuthNonConfirmedUserSignInHandlers,
} from "./initiate-auth";
import resendConfirmationCodeHandler from "./resend-confirmation-code";

type Options = BaseHandlerOptions & {
  readonly region: string;
  readonly debug?: boolean;
};

function createCognitoHandlersFactory({
  region,
  debug,
  ...baseOptions
}: Options) {
  const builders = createRestHandlersFactory({
    url: `https://cognito-idp.${region}.amazonaws.com`,
    debug,
  });
  return {
    changePasswordHandler: partial(changePasswordHandler, builders),
    initiateAuthNonConfirmedUserSignInHandlers: partial(
      initiateAuthNonConfirmedUserSignInHandlers,
      builders,
      baseOptions
    ),
    initiateAuthNewPasswordRequiredHandlers: partial(
      initiateAuthNewPasswordRequiredHandlers,
      builders,
      baseOptions
    ),
    confirmSignUpHandler: partial(confirmSignUpHandler, builders, baseOptions),
    resendConfirmationCodeHandler: partial(
      resendConfirmationCodeHandler,
      builders,
      baseOptions
    ),
  };
}

type CognitoHandlersFactory = ReturnType<typeof createCognitoHandlersFactory>;

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
