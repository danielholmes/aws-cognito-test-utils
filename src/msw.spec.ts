import { describe, it, before, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { setupServer } from "msw/node";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { createCognitoHandlersFactory } from "./msw.ts";

const testRegion = "ap-southeast-2";
const testUserPoolId = `${testRegion}_user-pool-1`;
const testUserPoolClientId = "user-pool-client-1";

describe("msw", () => {
	let server: ReturnType<typeof setupServer>;

	before(() => {
		server = setupServer();
		server.listen();
	});
	afterEach(() => server.resetHandlers());
	after(() => server.close());

	describe("signUp", () => {
		it("works for successful request", async () => {
			const factory = createCognitoHandlersFactory({
				userPoolClientId: "user-pool-client-1",
				userPoolId: testUserPoolId,
				debug: true,
			});
			let calls = 0;
			server.use(
				factory.signUpHandler(
					{
						Username: "tester@company.com",
						Password: "Test123!",
						UserAttributes: [
							{
								Name: "email",
								Value: "tester@company.com",
							},
							{ Name: "custom:account_type", Value: "INSTITUTION" },
						],
					},
					{ UserConfirmed: true, UserSub: "user-123" },
					{
						onCalled() {
							calls += 1;
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
						ClientId: testUserPoolClientId,
						Username: "tester@company.com",
						Password: "Test123!",
						UserAttributes: [
							{ Name: "email", Value: "tester@company.com" },
							{ Name: "custom:account_type", Value: "INSTITUTION" },
						],
					}),
				},
			);

			assert.equal(calls, 1);
			assert.equal(response.status, 200);
		});

		it("works for successful request using aws sdk", async () => {
			const factory = createCognitoHandlersFactory({
				userPoolClientId: testUserPoolClientId,
				userPoolId: testUserPoolId,
				debug: true,
			});
			let calls = 0;
			server.use(
				factory.signUpHandler(
					{
						Username: "tester@company.com",
						Password: "Test123!",
						UserAttributes: [
							{
								Name: "email",
								Value: "tester@company.com",
							},
							{ Name: "custom:account_type", Value: "INSTITUTION" },
						],
					},
					{ UserConfirmed: true, UserSub: "user-123" },
					{
						onCalled() {
							calls += 1;
						},
					},
				),
			);

			const client = new CognitoIdentityProvider({
				region: testRegion,
			});
			const response = await client.signUp({
				ClientId: testUserPoolClientId,
				Username: "tester@company.com",
				Password: "Test123!",
				UserAttributes: [
					{
						Name: "email",
						Value: "tester@company.com",
					},
					{ Name: "custom:account_type", Value: "INSTITUTION" },
				],
			});

			assert.equal(calls, 1);
			assert.equal(response.UserConfirmed, true);
			assert.equal(response.UserSub, "user-123");
		});
	});

	describe("adminGetUser", () => {
		it("works for successful request using aws sdk", async () => {
			const factory = createCognitoHandlersFactory({
				userPoolClientId: "user-pool-client-1",
				userPoolId: testUserPoolId,
				debug: true,
			});
			let calls = 0;
			const createdAt = new Date(2025, 0, 10).getTime() / 1_000;
			const updatedAt = new Date(2025, 0, 2).getTime() / 1_000;
			server.use(
				factory.adminGetUserHandler(
					{
						UserPoolId: testUserPoolId,
						Username: "tester@company.com",
					},
					{
						Username: "user-123",
						UserAttributes: [{ Name: "given_name", Value: "daniel" }],
						UserCreateDate: createdAt,
						UserLastModifiedDate: updatedAt,
						Enabled: true,
					},
					{
						onCalled() {
							calls += 1;
						},
					},
				),
			);

			const client = new CognitoIdentityProvider({
				region: "ap-southeast-2",
				credentials() {
					return Promise.resolve({
						accessKeyId: "test-access-1",
						secretAccessKey: "test-secret-access-1",
						sessionToken: "test-session-token-1",
					});
				},
			});
			const response = await client.adminGetUser({
				UserPoolId: testUserPoolId,
				Username: "tester@company.com",
			});

			assert.equal(calls, 1);
			assert.equal(response.Username, "user-123");
			assert.equal(response.Enabled, true);
			assert.equal(response.UserCreateDate?.getTime(), createdAt * 1_000);
			assert.equal(response.UserLastModifiedDate?.getTime(), updatedAt * 1_000);
		});
	});
});
