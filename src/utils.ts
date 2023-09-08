function createCognitoBaseUrl(region: string) {
	return `https://cognito-idp.${region}.amazonaws.com`;
}

export { createCognitoBaseUrl };
