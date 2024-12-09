import type { RestHandlersFactory } from "@dhau/msw-builders";
import type { DefaultBodyType, PathParams, RequestHandlerOptions } from "msw";
import { HttpResponse } from "msw";
import { isMatch } from "./utils.ts";

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
		readonly bodyMatcher?: RequestBody | ((body: RequestBody) => boolean);
		readonly matchResponse: {
			readonly status: number;
			readonly body: ResponseBody;
		};
	};

type HandlerOptions = RequestHandlerOptions & {
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
	}: CognitoPostOptions<Params, RequestBody, ResponseBody>,
	handlerOptions?: HandlerOptions,
) {
	const partialBodyMatch = userPoolClientId
		? { ClientId: userPoolClientId }
		: {};
	const body =
		typeof bodyMatcher === "function"
			? (b: RequestBody) => isMatch(b, partialBodyMatch) && bodyMatcher(b)
			: {
					...partialBodyMatch,
					...bodyMatcher,
				};
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			body: body as any,
		},
		() =>
			HttpResponse.json(matchResponse.body, {
				status: matchResponse.status,
			}),
		handlerOptions,
	);
}

export type { BaseHandlerOptions, HandlerOptions, CognitoPostOptions };
export { createCognitoPostHandler };
