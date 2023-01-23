# AWS Cognito Test Utils

[![Test](https://github.com/danielholmes/dhau-aws-cognito-test-utils/actions/workflows/test.yml/badge.svg)](https://github.com/danielholmes/dhau-aws-cognito-test-utils/actions/workflows/test.yml)

MSW handlers and other utilities for integration tests with AWS Cognito.

## Installation

```
npm add @dhau/aws-cognito-test-utils
```

## Local Development

### Setup

1. Install system dependencies using [ASDF](https://asdf-vm.com/), or manually install the dependencies in [`.tool-versions`](./.tool-versions)
2. Install project dependencies using `npm ci`

### Publishing

1. Manually set new version in `package.json`
2. `npm run deploy`