import { isMatch } from "lodash-es";
import { DefaultBodyType, PathParams, rest } from "msw";

type BaseOptions = {
  readonly region: string;
  readonly userPoolClientId: string;
};

type CognitoPostOptions<
  Params extends PathParams<keyof Params> = PathParams<string>,
  ResponseBody extends DefaultBodyType = DefaultBodyType
> = Omit<BaseOptions, "userPoolClientId"> &
  Partial<Pick<BaseOptions, "userPoolClientId">> & {
    readonly target: string;
    readonly bodyMatcher?: Record<string, unknown>;
    readonly successResponse: ResponseBody;
    readonly onSuccess?: () => void;
  };

function createCognitoPostHandler<
  Params extends PathParams<keyof Params> = PathParams<string>,
  ResponseBody extends DefaultBodyType = DefaultBodyType
>({
  region,
  userPoolClientId,
  target,
  bodyMatcher,
  onSuccess,
  successResponse,
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

      if (onSuccess) {
        onSuccess();
      }
      return res(ctx.json(successResponse));
    }
  );
}

export { createCognitoPostHandler };
