# mocha-reporter-json-standard
Report Mocha test runner output to a standardized CI tooling output JSON format

## Description
Report Mocha test runner output in a compact way, grouping together all succesful results belonging to the same suite. Reports the output to a [standardized CI tooling output JSON format](https://raw.githubusercontent.com/Hypothesize/mocha-reporter-json-standard-grouped/master/src/check-general.schema.json).

This package is part of the series of packages for reporting tooling output in a standardized JSON format for use with the [ci-checks-action](https://github.com/marketplace/actions/create-github-checks-from-code-check-script-output-files) Github action. 

The other packages include:
- [eslint-formatter-json-standard](https://www.npmjs.com/package/eslint-formatter-json-standard)
- [mocha-reporter-json-standard](https://github.com/agyemanjp/mocha-reporter-json-standard)


## Install 
`npm install --save mocha-reporter-json-standard`

## Usage
`mocha dist/*.test.js --reporter mocha-reporter-json-standard >| test-report.json`

This will test all _*.test.js_ files in the _/dist_ folder and output the results file _test-report.json_
