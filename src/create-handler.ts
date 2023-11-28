import { RestHandlersFactory } from "@dhau/msw-builders";
import { DefaultBodyType, HttpResponse, PathParams } from "msw";
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
		readonly bodyMatcher?: RequestBody | ((body: RequestBody) => boolean);
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
	const partialBodyMatch = userPoolClientId
		? { ClientId: userPoolClientId }
		: {};
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
			body:
				typeof bodyMatcher === "function"
					? (b: any) => isMatch(b, partialBodyMatch) && bodyMatcher(b)
					: ({
							...partialBodyMatch,
							...bodyMatcher,
					  } as any),
		},
		() =>
			HttpResponse.json(matchResponse.body, {
				status: matchResponse.status,
			}) as any,
		{ onCalled },
	);
}

export type { BaseHandlerOptions, CognitoPostOptions };
export { createCognitoPostHandler };
