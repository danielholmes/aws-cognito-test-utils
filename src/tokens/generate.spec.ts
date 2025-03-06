import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateCognitoUserTokens } from "./generate.ts";

describe("generate", () => {
	it("generates stable tokens across different times", async () => {
		const tokensConfig = {
			issuerDomain: "test",
			userPoolId: "test-pool-1",
			userPoolClientId: "test-pool-client-1",
		};
		const user = {
			Username: "user-123",
		};
		const options = {
			authTime: 123,
			idToken: {
				eventId: "event-123",
				jti: "jti-id",
			},
			accessToken: {
				eventId: "event-123",
				jti: "jti-access",
			},
			refreshToken: {
				eventId: "event-123",
				jti: "jti-refresh",
			},
		};

		const tokens1 = generateCognitoUserTokens(tokensConfig, user, options);
		await new Promise((resolve) => setTimeout(resolve, 1_000));
		const tokens2 = generateCognitoUserTokens(tokensConfig, user, options);

		assert.deepEqual(tokens1, tokens2);
	});
});
