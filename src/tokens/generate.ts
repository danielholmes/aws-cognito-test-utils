import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { privateKey } from "./keys.ts";
import type { UserTokens } from "./types.ts";

type RawToken = Record<
	string,
	string | number | boolean | undefined | readonly string[]
>;

type User = {
	readonly Username: string;
	readonly Attributes?: readonly { Name: string; Value: string }[];
	// userGroups?: readonly string[],
};

type ValidityUnit = "seconds" | "minutes" | "hours" | "days";

function formatExpiration({
	duration,
	unit,
}: TokenValidity): `${number}${ValidityUnit}` {
	return `${duration}${unit}`;
}

type TokenValidity = {
	readonly duration: number;
	readonly unit: ValidityUnit;
};

const defaultIdValidity = {
	duration: 24,
	unit: "hours",
} satisfies TokenValidity;

const defaultAccessValidity = {
	duration: 24,
	unit: "hours",
} satisfies TokenValidity;

const defaultRefreshValidity = {
	duration: 7,
	unit: "days",
} satisfies TokenValidity;

type GenerateCognitoUserTokensConfig = {
	readonly issuerDomain: string;
	readonly userPoolId: string;
	readonly userPoolClientId: string;
};

type GenerateTokenOptions = {
	readonly eventId?: string;
	readonly jti?: string;
	readonly expiresIn?: TokenValidity;
};

type GenerateCognitoUserTokensOptions = {
	readonly authTime?: number;
	readonly idToken?: GenerateTokenOptions;
	readonly accessToken?: GenerateTokenOptions;
	readonly refreshToken?: GenerateTokenOptions;
};

function generateCognitoUserTokens(
	{
		issuerDomain,
		userPoolId,
		userPoolClientId,
	}: GenerateCognitoUserTokensConfig,
	user: User,
	options?: GenerateCognitoUserTokensOptions,
): UserTokens {
	const defaultEventId = uuid();
	const authTime = options?.authTime ?? Math.floor(new Date().getTime() / 1000);
	const sub = user.Attributes?.find((a) => a.Name === "sub")?.Value;

	const accessOptions = {
		eventId: defaultEventId,
		jti: uuid(),
		expiresIn: defaultAccessValidity,
		...options?.accessToken,
	};
	const accessToken: RawToken = {
		auth_time: authTime,
		client_id: userPoolClientId,
		event_id: accessOptions.eventId,
		iat: authTime,
		jti: accessOptions.jti,
		scope: "aws.cognito.signin.user.admin", // TODO: scopes
		sub,
		token_use: "access",
		username: user.Username,
	};

	const idOptions = {
		eventId: defaultEventId,
		jti: uuid(),
		expiresIn: defaultIdValidity,
		...options?.idToken,
	};
	const idToken: RawToken = {
		"cognito:username": user.Username,
		auth_time: authTime,
		email: user.Attributes?.find((a) => a.Name === "email")?.Value,
		email_verified: Boolean(
			user.Attributes?.find((a) => a.Name === "email_verified")?.Value ?? false,
		),
		event_id: idOptions.eventId,
		iat: authTime,
		jti: idOptions.jti,
		sub,
		token_use: "id",
		...Object.fromEntries(
			(user.Attributes?.filter((a) => a.Name.startsWith("custom:")) ?? []).map(
				(a) => [a.Name, a.Value],
			),
		),
	};

	const refreshOptions = {
		jti: uuid(),
		expiresIn: defaultRefreshValidity,
		...options?.idToken,
	};
	const refreshToken = {
		"cognito:username": user.Username,
		email: user.Attributes?.find((a) => a.Name === "email")?.Value,
		iat: authTime,
		expiresIn: formatExpiration(refreshOptions.expiresIn),
		jti: refreshOptions.jti,
	};

	const issuer = `${issuerDomain}/${userPoolId}`;

	return {
		AccessToken: jwt.sign(accessToken, privateKey.pem, {
			algorithm: privateKey.jwk.alg,
			issuer,
			expiresIn: formatExpiration(accessOptions.expiresIn),
			keyid: privateKey.jwk.kid,
		}),
		IdToken: jwt.sign(idToken, privateKey.pem, {
			algorithm: privateKey.jwk.alg,
			issuer,
			expiresIn: formatExpiration(idOptions.expiresIn),
			audience: userPoolClientId,
			keyid: privateKey.jwk.kid,
		}),
		// this content is for debugging purposes only
		// in reality token payload is encrypted and uses different algorithm
		RefreshToken: jwt.sign(refreshToken, privateKey.pem, {
			algorithm: privateKey.jwk.alg,
			issuer,
			expiresIn: formatExpiration(refreshOptions.expiresIn),
		}),
	};
}

export type {
	GenerateCognitoUserTokensOptions,
	GenerateCognitoUserTokensConfig,
	User,
};
export { generateCognitoUserTokens };
