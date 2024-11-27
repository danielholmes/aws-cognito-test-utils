import { describe, it, before, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { setupServer } from "msw/node";
import { createCognitoHandlersFactory } from "./msw.ts";

describe("msw", () => {
	describe("signUp", () => {
		let server: ReturnType<typeof setupServer>;

		before(() => {
			server = setupServer();
			server.listen();
		});
		afterEach(() => server.resetHandlers());
		after(() => server.close());

		it("works for successful request", async () => {
			const factory = createCognitoHandlersFactory({
				userPoolClientId: "user-pool-client-1",
				userPoolId: "ap-southeast-2_user-pool-1",
				debug: true,
			});
			let signUpCalled = false;
			server.use(
				factory.signUpHandler(
					{
						Username: "tester@company.com",
						Password: "Test123!",
						UserAttributes: {
							email: "tester@company.com",
							"custom:account_type": "INSTITUTION",
						},
					},
					undefined,
					{
						onCalled() {
							signUpCalled = true;
						},
					},
				),
			);

			const response = await fetch(
				"https://cognito-idp.ap-southeast-2.amazonaws.com",
				{
					method: "POST",
					headers: {
						"x-amz-target": "AWSCognitoIdentityProviderService.SignUp",
						"Content-type": "application/json",
					},
					body: JSON.stringify({
						ClientId: "user-pool-client-1",
						Username: "tester@company.com",
						Password: "Test123!",
						UserAttributes: [
							{ Name: "email", Value: "tester@company.com" },
							{ Name: "custom:account_type", Value: "INSTITUTION" },
						],
					}),
				},
			);

			assert.equal(signUpCalled, true);
			assert.equal(response.status, 200);
		});
	});
});
