import { partial } from "lodash-es";
import { DefaultBodyType, MockedRequest, RestHandler } from "msw";
import { BaseEndpointOptions } from "./create-handler";
import {
  initiateAuthNewPasswordRequiredHandlers,
  InitiateAuthNewPasswordRequiredOptions,
} from "./initiate-auth";

type CognitoHandlersFactory = {
  readonly initiateAuthNewPasswordRequiredHandlers: (
    options: InitiateAuthNewPasswordRequiredOptions
  ) => ReadonlyArray<RestHandler<MockedRequest<DefaultBodyType>>>;
};

function createCognitoHandlersFactory(
  baseOptions: BaseEndpointOptions
): CognitoHandlersFactory {
  return {
    initiateAuthNewPasswordRequiredHandlers: partial(
      initiateAuthNewPasswordRequiredHandlers,
      baseOptions
    ),
  };
}

export type { CognitoHandlersFactory };
export { createCognitoHandlersFactory };
