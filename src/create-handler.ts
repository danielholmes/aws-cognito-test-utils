import { isMatch } from "lodash-es";
import { DefaultBodyType, PathParams, rest } from "msw";

type BaseEndpointOptions = {
  readonly region: string;
  readonly userPoolClientId: string;
};

type CognitoPostOptions<
  Params extends PathParams<keyof Params> = PathParams<string>,
  ResponseBody extends DefaultBodyType = DefaultBodyType
> = Omit<BaseEndpointOptions, "userPoolClientId"> &
  Partial<Pick<BaseEndpointOptions, "userPoolClientId">> & {
    readonly target: string;
    readonly bodyMatcher?: Record<string, unknown>;
    readonly matchResponse: {
      readonly status: number;
      readonly body: ResponseBody;
    };
    readonly onCalled?: () => void;
  };

function createCognitoPostHandler<
  Params extends PathParams<keyof Params> = PathParams<string>,
  ResponseBody extends DefaultBodyType = DefaultBodyType
>({
  region,
  userPoolClientId,
  target,
  bodyMatcher,
  onCalled,
  matchResponse,
}: CognitoPostOptions<Params, ResponseBody>) {
  return rest.post<DefaultBodyType, Params, ResponseBody>(
    `https://cognito-idp.${region}.amazonaws.com/`,
    (req, res, ctx) => {
      if (req.headers.get("x-amz-target") !== target) {
        return undefined;
      }

      const body: Record<string, unknown> =
        typeof req.body === "object" && req.body ? req.body : {};
      if (!!userPoolClientId && body.ClientId !== userPoolClientId) {
        return undefined;
      }

      if (bodyMatcher && !isMatch(body, bodyMatcher)) {
        return undefined;
      }

      if (onCalled) {
        onCalled();
      }
      return res(
        ctx.status(matchResponse.status),
        ctx.json(matchResponse.body)
      );
    }
  );
}

export type { BaseEndpointOptions, CognitoPostOptions };
export { createCognitoPostHandler };
