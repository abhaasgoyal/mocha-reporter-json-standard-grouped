/*
 * TODO:
 * Tests for
 * 1. testReporterOptions
 * 2. reporterStats = suites passed failed pending total
 */
import * as assert from "assert"
import * as fs from "fs"
import Mocha, { Func, AsyncFunc } from "mocha"
import MochaGroupedReporter from "../dist/index"
import { ReporterOptions } from "../src/types"

const { Runner, Suite, Test } = Mocha

const exampleErrObj = { expected: 1, actual: 2 }
const defaultReporterOptions: ReporterOptions = {
	quiet: true, // Not display output schema on console
	saveJSONFile: false,
	saveJSONVar: false, // Save to JSON variable for persistence after `Runner`
	reportFileName: '', // Report filename when file is saved
}

const createMochaReporter = (mocha: Mocha,
	runner: Mocha.Runner) =>
	(reporterOptions: ReporterOptions) =>
		new (<any>mocha)._reporter(runner, reporterOptions)
const generateTest = (title: string, doneFn?: Func | AsyncFunc) => new Test(title, doneFn)
const passingTest = (title: string) => generateTest(title, () => { })
const failingTest = (title: string) => generateTest(title, tDone => tDone(new assert.AssertionError(exampleErrObj)))
const sampleFileCompare = (fileName: string, mochaReporter: typeof MochaGroupedReporter) => {
	let expectedFileString = fs.readFileSync(fileName, 'utf-8')
	assert.strictEqual(expectedFileString, (<any>mochaReporter).reportData + "\n")
}

const genRandNat = (max: number) => Math.floor(Math.random() * max) + 1

describe('Grouped Mocha Test Reporter', () => {

	let mocha: Mocha
	let suite: Mocha.Suite
	let runner: Mocha.Runner
	let mochaReporter: typeof MochaGroupedReporter
	let subSuite1: Mocha.Suite
	let initReporter: (ReporterOptions: ReporterOptions) => typeof MochaGroupedReporter

	beforeEach(() => {

		mocha = new Mocha({
			reporter: MochaGroupedReporter
		})
		suite = new Suite("")
		suite.root = true
		subSuite1 = new Suite("Group 1")
		runner = new Runner(suite, false)
		suite.addSuite(subSuite1)
		initReporter = createMochaReporter(mocha, runner)
	})

	describe("0/1 suite tests", () => {

		it('work on empty suite', function(done) {
			mochaReporter = initReporter(defaultReporterOptions)
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 1 passing test', function(done) {
			const test = passingTest("Passing Test")
			subSuite1.addTest(test)
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should match defined schema on using saveJSONVar', function(done) {
			const nTests = 7
			mochaReporter = initReporter({
				...defaultReporterOptions,
				saveJSONVar: true
			})

			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			runner.run(failureCount => {
				sampleFileCompare('test/sample-single-suite.json', mochaReporter)
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 1 failure', function(done) {
			const test = failingTest('failing test')
			subSuite1.addTest(test)
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 1)
				done()
			})
		})

		it('should list every failed test', function(done) {
			const nTests = genRandNat(10)
			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(failureCount => {
				assert.strictEqual(failureCount, nTests)
				done()
			})
		})

		it('should list only the failed tests on group of passing and failing tests', function(done) {
			const nPassingTests = genRandNat(10)
			const nFailingTests = genRandNat(10)
			for (let i: number = 0; i < nPassingTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			for (let i: number = 0; i < nFailingTests; i++) {
				subSuite1.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(failureCount => {
				assert.strictEqual(failureCount, nFailingTests)
				// console.log((<any>mochaReporter).reportData)
				done()
			})
		})

	})

	describe("MultiSuite Tests", () => {

		it('should have 1 passing test in 2 suites', function(done) {
			let subSuite2: Mocha.Suite = new Suite("Group 2")
			suite.addSuite(subSuite2)
			const test = passingTest('passing test')
			subSuite1.addTest(test)
			subSuite2.addTest(test)

			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 1 passing/1 failing test in 2 suites', function(done) {
			let subSuite2: Mocha.Suite = new Suite("Group 2")
			suite.addSuite(subSuite2)
			subSuite1.addTest(passingTest('passing test'))
			subSuite2.addTest(failingTest(`failing test`))

			runner.run(failureCount => {
				assert.strictEqual(failureCount, 1)
				done()
			})
		})
	})
})
