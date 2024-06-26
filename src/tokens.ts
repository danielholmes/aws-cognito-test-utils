import { createCognitoBaseUrl } from "./utils.ts";

// "=" Padding is meant to be removed. See
// https://datatracker.ietf.org/doc/html/rfc7515#section-3.2
function encodeToken(
	first: Record<string, unknown>,
	second: Record<string, unknown>,
) {
	return [first, second]
		.map((c) =>
			Buffer.from(JSON.stringify(c)).toString("base64").replace(/=/g, ""),
		)
		.join(".");
}

type UserTokens = {
	readonly id: string;
	readonly refresh: string;
	readonly access: string;
	readonly userData: string;
};

type UserTokensOptions = {
	readonly region: string;
	readonly userPoolId: string;
	readonly userId: string;
	readonly email: string;
	readonly emailVerified: boolean;
	readonly extraAttributes?: Record<string, string>;
};

function createUserTokensForDate(
	{
		region,
		userPoolId,
		userId,
		email,
		emailVerified,
		extraAttributes,
	}: UserTokensOptions,
	date: Date,
): UserTokens {
	const dateSecs = Math.floor(date.getTime() / 1000);
	const cognitoBaseUrl = createCognitoBaseUrl(region);
	const tokenCommonProps = {
		iss: `${cognitoBaseUrl}/${userPoolId}`,
		sub: userId,
		auth_time: dateSecs,
		iat: dateSecs,
		exp: dateSecs + 999999,
		origin_jti: "1b2d2e93-f60b-40f6-b2d0-57266e6c6483",
		event_id: "84db83da-0c18-448f-b2c2-061574d192ea",
	};

	return {
		id: encodeToken(
			{
				kid: "h0rCyleyVUuo80GzDhU2DAwl3MLwQ6nGm6dPPxskcIc=",
				alg: "RS256",
			},
			{
				email_verified: emailVerified,
				"cognito:username": userId,
				aud: "uep8k61j1p5fahv8jon0e70qs",
				token_use: "id",
				jti: "f704dca1-7ca2-4ce9-9321-8e9f174ecc63",
				email,
				...tokenCommonProps,
			},
		),
		refresh: "refresh-123",
		access: encodeToken(
			{
				kid: "h0rCyleyVUuo80GzDhU2DAwl3MLwQ6nGm6dPPxskcIc=",
				alg: "RS256",
			},
			{
				client_id: "uep8k61j1p5fahv8jon0e70qs",
				token_use: "access",
				scope: "aws.cognito.signin.user.admin",
				jti: "2f938ed4-c432-4430-b3c1-bb817c61df10",
				username: userId,
				...tokenCommonProps,
			},
		),
		userData: JSON.stringify({
			UserAttributes: [
				{ Name: "sub", Value: userId },
				{ Name: "email_verified", Value: "true" },
				{ Name: "email", Value: email },
				...Object.entries(extraAttributes ?? {}).map(([key, value]) => ({
					Name: key,
					Value: value,
				})),
			],
			Username: userId,
		}),
	};
}

function createUserTokensForNow(options: UserTokensOptions): UserTokens {
	return createUserTokensForDate(options, new Date());
}

type CognitoStorageOptions = {
	readonly userPoolClientId: string;
	readonly userId: string;
};

function populateCognitoLocalStorage(
	localStorage: WindowLocalStorage["localStorage"],
	{ userPoolClientId, userId }: CognitoStorageOptions,
	{ id, refresh, access, userData }: UserTokens,
) {
	const clientPrefix = `CognitoIdentityServiceProvider.${userPoolClientId}`;
	const userPrefix = `${clientPrefix}.${userId}`;
	localStorage.setItem(`${clientPrefix}.LastAuthUser`, userId);
	localStorage.setItem(`${userPrefix}.idToken`, id);
	localStorage.setItem(`${userPrefix}.refreshToken`, refresh);
	localStorage.setItem(`${userPrefix}.accessToken`, access);
	localStorage.setItem(`${userPrefix}.userData`, userData);
}

export type { UserTokens };
export {
	populateCognitoLocalStorage,
	createUserTokensForDate,
	createUserTokensForNow,
};
