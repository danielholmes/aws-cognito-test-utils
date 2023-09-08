import { RestHandlersFactory } from "@dhau/msw-builders";
import { DefaultBodyType, PathParams } from "msw";
import { isMatch } from "lodash-es";

type BaseHandlerOptions = {
	readonly userPoolClientId: string;
};

type CognitoPostOptions<
	Params extends PathParams<keyof Params> = PathParams<string>,
	RequestBody extends Record<string, unknown> = Record<string, unknown>,
	ResponseBody extends DefaultBodyType = DefaultBodyType,
> = Omit<BaseHandlerOptions, "userPoolClientId"> &
	Partial<Pick<BaseHandlerOptions, "userPoolClientId">> & {
		readonly target: string;
		readonly bodyMatcher?: RequestBody;
		readonly matchResponse: {
			readonly status: number;
			readonly body: ResponseBody;
		};
		readonly onCalled?: () => void;
	};

function createCognitoPostHandler<
	TSearchParams extends Record<string, string>,
	Params extends PathParams<keyof Params> = PathParams<string>,
	RequestBody extends Record<string, unknown> = Record<string, unknown>,
	ResponseBody extends DefaultBodyType = DefaultBodyType,
>(
	factory: RestHandlersFactory,
	{
		userPoolClientId,
		target,
		bodyMatcher,
		matchResponse,
		onCalled,
	}: CognitoPostOptions<Params, RequestBody, ResponseBody>,
) {
	return factory.post<
		TSearchParams,
		{ "x-amz-target": string },
		RequestBody & { readonly ClientId?: string },
		Params,
		ResponseBody
	>(
		"",
		{
			headers: (v) =>
				typeof v === "object" &&
				!!v &&
				isMatch(v, {
					"x-amz-target": target,
				}),
			body: {
				...(userPoolClientId ? { ClientId: userPoolClientId } : {}),
				...bodyMatcher,
			} as any,
		},
		(_, res, ctx) =>
			res(ctx.status(matchResponse.status), ctx.json(matchResponse.body)),
		{ onCalled },
	);
}

export type { BaseHandlerOptions, CognitoPostOptions };
export { createCognitoPostHandler };
