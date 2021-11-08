import * as assert from "assert"
// import * as childProcess from "child_process"
import Mocha, { Func, AsyncFunc, Stats } from "mocha"
import MochaGroupedReporter from "../dist/index"
import createStatsCollector from "mocha/lib/stats-collector"

const { Runner, Suite, Test } = Mocha

const exampleErrObj = { expected: 1, actual: 2 }
const generateTest = (title: string, doneFn?: Func | AsyncFunc) => new Test(title, doneFn)
const passingTest = (title: string) => generateTest(title, () => { })
const failingTest = (title: string) => generateTest(title, tDone => tDone(new assert.AssertionError(exampleErrObj)))


describe('Grouped Mocha Test Reporter', () => {

	let mocha: Mocha
	let suite: Mocha.Suite
	let runner: Mocha.Runner
	let mochaReporter: Mocha.reporters.Base
	let subSuite1: Mocha.Suite

	beforeEach(() => {

		mocha = new Mocha({
			reporter: MochaGroupedReporter
		})
		suite = new Suite("")
		subSuite1 = new Suite("Group 1")
		runner = new Runner(suite, false)
		suite.addSuite(subSuite1)
		createStatsCollector(runner)
		mochaReporter = new (<any>mocha)._reporter(runner, {})
	})

	describe("0/1 suite tests", () => {

		it('should have 0 passing test if empty suite', function(done) {
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				console.log(mochaReporter)
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

		it('should group 7 passing tests in one group', function(done) {
			const nTests = 7
			for (let i: number = 0; i < nTests; i++) {
				subSuite1.addTest(passingTest(`passing test ${i}`))
			}
			runner.run(failureCount => {
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

const genRandNat = (max: number) => Math.floor(Math.random() * max) + 1
