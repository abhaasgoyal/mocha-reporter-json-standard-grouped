/* eslint-disable fp/no-mutating-methods */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable fp/no-mutation */

import { Runner, reporters, Test, Suite, MochaOptions, Stats } from 'mocha'
import { CheckGeneralSchema } from "./check-general"
import { ReporterOptions } from "./types"

const Date = global.Date

export default class MochaGroupedReporter extends reporters.Base {

	reportData: string
	stats!: Stats

	constructor(runner: Runner, options: MochaOptions) {
		super(runner, options)
		reporters.Base.call(this, runner, options)
		this.reportData = ""

		const {
			EVENT_RUN_BEGIN,
			EVENT_SUITE_BEGIN,
			EVENT_RUN_END,
			EVENT_SUITE_END,
			EVENT_TEST_PASS,
			EVENT_TEST_FAIL,
			EVENT_TEST_END
		} = Runner.constants

		const results: CheckGeneralSchema = {
			name: "Mocha unit tests",
			description: "Mocha unit tests",
			summary: "",
			counts: { failure: 0, warning: 0, notice: 0 },
			byFile: {},
		}

		this.stats = {
			suites: 0,
			tests: 0,
			passes: 0,
			pending: 0,
			failures: 0
		} as Stats

		const reporterOptions: ReporterOptions = {
			quiet: false,
			saveJSONVar: false,
			saveJSONFile: false,
			reportFileName: '',
			reportData: '',
			...options
		}

		const individualTests: Test[] = []
		const rootSuites: { [key: string]: Test[] } = {}

		runner.once(EVENT_RUN_BEGIN, () => {
			this.stats.start = new Date()
		})

		runner.on(EVENT_SUITE_BEGIN, (suite) => {
			if (suite.root !== true) {
				this.stats.suites++
			}
		})

		runner.on(EVENT_TEST_END, () => {
			this.stats.tests++
		})

		runner.on(EVENT_SUITE_END, (suite) => {
			if (suite.root !== true) {
				const topMostSuite = getTopMostTitledSuite(suite)
				const existingTopSuite = rootSuites[topMostSuite.title]
				rootSuites[topMostSuite.title] = existingTopSuite !== undefined
					? [...existingTopSuite, ...suite.tests]
					: suite.tests
			}
		})

		runner.on(EVENT_TEST_PASS, (test) => {
			individualTests.push(test)
		})

		runner.on(EVENT_TEST_FAIL, (test) => {
			individualTests.push(test)
			this.stats.failures++
		})

		runner.on(EVENT_RUN_END, () => {
			const successfulSuiteNames = Object.keys(rootSuites).filter(sName => rootSuites[sName].every(t => t.state === "passed"))
			const individualFailures = individualTests.filter(t => t.state !== "passed")

			this.stats.passes = results.counts.notice = successfulSuiteNames.length
			results.counts.failure = individualFailures.length
			results.byFile["General"] = {
				summary: "",
				counts: { failure: results.counts.failure, warning: 0, notice: results.counts.notice },
				details: [
					...successfulSuiteNames.map((sName, i) => ({
						Id: `success-${i}`,
						title: sName,
						message: `${rootSuites[sName].length} tests passed`,
						category: "notice" as CheckGeneralSchema["byFile"]["details"]["details"][0]["category"],
						rawDetails: rootSuites[sName].map(t => t.title).join("\n")
					})),
					...individualFailures.map((f, i) => ({
						Id: `failure-${i}`,
						title: f.title,
						message: f.err?.message || "Error",
						category: "failure" as CheckGeneralSchema["byFile"]["details"]["details"][0]["category"]
					}))
				]
			} // as CheckGeneralSchema["byFile"]

			const reportData: string = JSON.stringify(results, null, 2)
			if (reporterOptions.quiet !== true) {
				console.log(reportData)
			}
			this.reportData = reportData
			this.stats.end = new Date()
		})
	}
}

const getTopMostTitledSuite = (suite: Suite): Suite => {
	return (suite.parent === undefined || suite.parent.title === "") ? suite : getTopMostTitledSuite(suite.parent)
}
