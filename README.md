# mocha-reporter-json-standard-grouped

Format Mocha test runner output to standardized JSON, grouped by successful suites and individual failed tests

## Description

Report Mocha test runner output to a [standardized CI tooling output in JSON format](https://raw.githubusercontent.com/Hypothesize/mocha-reporter-json-standard-grouped/master/src/check-general.schema.json).

In the process, it groups together all successful results belonging to the same suite and all individual failures.

It supports passing in comma-separated options to the reporter with mocha's `--reporter-options` flag. The available options are:

| Option Name      | Type    | Default   | Description                                                    |
| :--------------- | :------ | :-------- | :------------------------------------------------------------- |
| `quiet`          | boolean | false     | Silence console log output                                     |
| `saveJSONVar`    | boolean | false     | Saves output to the `stats` property of `Mocha.reporters.Base` |
| `reportFileName` | string? | undefined | If defined, save output to `reportFileName`                    |

This package is part of the series of packages for reporting tooling output in a standardized JSON format for use with the [ci-checks-action](https://github.com/marketplace/actions/create-github-checks-from-code-check-script-output-files) Github action.

Other related packages include:

- [eslint-formatter-json-standard](https://www.npmjs.com/package/eslint-formatter-json-standard)

## Install

`npm install --save mocha-reporter-json-standard-grouped`

## Usage

`mocha dist/index.test.js --reporter mocha-reporter-json-standard-grouped --reporter-options quiet=true,reportFileName=test-report.json`

This will run mocha tests from the entry point `dist/index.test.js` and does not show the reporter results in console, instead sending it to the file _test-report.json_
