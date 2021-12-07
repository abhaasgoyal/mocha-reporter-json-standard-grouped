/* eslint-disable fp/no-mutation */

import * as assert from "assert"
import * as fs from "fs"
import Mocha = require("mocha")
import MochaGroupedReporter = require("../dist/index")
import { ReporterOptions } from "../src/types"

const { Runner, Suite, Test } = Mocha

const exampleErrObj = { expected: 1, actual: 2 }
const defaultReporterOptions: ReporterOptions = {
	quiet: true,
	saveJSONVar: false,
}

type SecondConstructorArg<C> = C extends {
	new(_: any, arg: infer A, ...args: any[]): any
} ? A : never

const createMochaReporter = (mocha: Mocha,
	runner: Mocha.Runner) =>
	(reporterOptions: ReporterOptions) =>
		new (<any>mocha)._reporter(runner, reporterOptions)
const generateTest = (title: string, doneFn?: SecondConstructorArg<typeof Mocha.Runnable>) => new Test(title, doneFn)
const passingTest = (title: string) => generateTest(title, () => { })
const failingTest = (title: string) => generateTest(title, tDone => tDone(new assert.AssertionError(exampleErrObj)))
const sampleFileCompare = (fileName: string, mochaReporter: Mocha.reporters.Base) => {
	let expectedFileString = fs.readFileSync(fileName, 'utf-8')
	assert.strictEqual(expectedFileString, (<any>mochaReporter).reportData + "\n")
}

const genRandNat = (max: number) => Math.floor(Math.random() * max) + 1

describe('Grouped Mocha Test Reporter', () => {

	let mocha: Mocha
	let suite: Mocha.Suite
	let runner: Mocha.Runner
	let mochaReporter: Mocha.reporters.Base
	let subSuite1: Mocha.Suite
	let initReporter: (ReporterOptions: ReporterOptions) => Mocha.reporters.Base

	beforeEach(() => {

		mocha = new Mocha({
			reporter: MochaGroupedReporter
		})
		suite = new Suite("")
		suite.root = true
		subSuite1 = new Suite("Group 1")
		// @ts-ignore: @types/mocha refers to a deprecated version of creating a new runner instance
		runner = new Runner(suite, { delay: false })
		suite.addSuite(subSuite1)
		initReporter = createMochaReporter(mocha, runner)
	})

	afterEach(() => {
		// Dispose the runner listener manually
		(<any>runner).dispose()
	})

	describe("Reporter Option Tests", () => {
		it('should match defined schema on using saveJSONVar (single suite)', function(done) {
			const nTests = 7
			mochaReporter = initReporter({
				...defaultReporterOptions,
				saveJSONVar: true
			})


			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			runner.run(_ => {
				sampleFileCompare('test/sample-single-suite.json', mochaReporter)
				assert.deepStrictEqual({
					"suites": 1,
					"tests": nTests,
					"passes": 1,
					"pending": 0,
					"failures": 0
				},
					mochaReporter.stats)
				done()
			})
		})

		it('should match defined schema on using saveJSONVar (multi suite)', function(done) {
			const nPassSuites = 4
			const nFailSuites = 5
			mochaReporter = initReporter({
				...defaultReporterOptions,
				saveJSONVar: true
			})

			for (let i: number = 0; i < nPassSuites; i++) {
				let subSuite: Mocha.Suite = new Suite(`Group ${i + 1}`)
				suite.addSuite(subSuite)
				for (let j: number = 0; j <= i; j++) {
					subSuite.addTest(passingTest(`passing test ${i}`))
				}

			}
			for (let i: number = 0; i < nFailSuites; i++) {
				let subSuite: Mocha.Suite = new Suite(`Group ${i + nPassSuites + 1} `)
				suite.addSuite(subSuite)
				for (let j: number = 0; j <= i; j++) {
					subSuite.addTest(failingTest(`failing test ${i}`))
				}

			}

			runner.run(_ => {
				sampleFileCompare('test/sample-multi-suite.json', mochaReporter)
				assert.deepStrictEqual({
					"suites": 9,
					"tests": 25,
					"passes": 4,
					"pending": 0,
					"failures": 15
				},
					mochaReporter.stats)
				done()
			})
		})
		it('should save files to reportFileName on saveJSONFile', function(done) {
			const nTests = 7
			mochaReporter = initReporter({
				...defaultReporterOptions,
				reportFileName: "test/temp-sample.json"
			})
			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			runner.run(_ => {
				let actualData = fs.readFileSync("test/temp-sample.json", "utf-8")
				let expectedData = fs.readFileSync("test/sample-single-suite.json", "utf-8")
				assert.strictEqual(actualData + "\n", expectedData)
				fs.unlinkSync("test/temp-sample.json")
				done()
			})
		})
	})

	describe("Empty and single suite tests", () => {

		it('work on empty suite', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 0,
					"tests": 0,
					"passes": 0,
					"pending": 0,
					"failures": 0
				},
					mochaReporter.stats)
				done()
			})
		})

		it('Basic passing test', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			const test = passingTest("Passing Test")
			subSuite1.addTest(test)
			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 1,
					"tests": 1,
					"passes": 1,
					"pending": 0,
					"failures": 0
				},
					mochaReporter.stats)
				done()
			})
		})


		it('Basic Failure Tests', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			const test = failingTest('failing test')
			subSuite1.addTest(test)
			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 1,
					"tests": 1,
					"passes": 0,
					"pending": 0,
					"failures": 1
				},
					mochaReporter.stats)
				done()
			})
		})

		it('Multi failure test', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			const nTests = genRandNat(10)
			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 1,
					"tests": nTests,
					"passes": 0,
					"pending": 0,
					"failures": nTests
				},
					mochaReporter.stats)
				done()
			})

		})

		it('should list only the failed tests on mixture of passing and failing tests', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			const nPassingTests = genRandNat(10)
			const nFailingTests = genRandNat(10)
			for (let i: number = 0; i < nPassingTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			for (let i: number = 0; i < nFailingTests; i++) {
				subSuite1.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 1,
					"tests": nPassingTests + nFailingTests,
					"passes": 0,
					"pending": 0,
					"failures": nFailingTests
				},
					mochaReporter.stats)
				done()
			})
		})

	})

	describe("MultiSuite Tests", () => {

		it('Basic Passing Tests', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			let subSuite2: Mocha.Suite = new Suite("Group 2")
			suite.addSuite(subSuite2)
			const test = passingTest('passing test')
			subSuite1.addTest(test)
			subSuite2.addTest(test)

			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 2,
					"tests": 2,
					"passes": 2,
					"pending": 0,
					"failures": 0
				},
					mochaReporter.stats)
				done()
			})
		})

		it('Mixture of Passing and Failing Tests', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			let subSuite2: Mocha.Suite = new Suite("Group 2")
			suite.addSuite(subSuite2)
			subSuite1.addTest(passingTest('passing test'))
			subSuite2.addTest(failingTest(`failing test`))

			runner.run(_ => {
				assert.deepStrictEqual({
					"suites": 2,
					"tests": 2,
					"passes": 1,
					"pending": 0,
					"failures": 1
				},
					mochaReporter.stats)
				done()
			})
		})
	})
})
