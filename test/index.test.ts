import * as assert from "assert"
// import * as childProcess from "child_process"
import Mocha from "mocha"
import MochaGroupedReporter from "../src/index"

const { Runner, Suite, Test } = Mocha

const exampleErrObj = { expected: 1, actual: 2 }
const generateTest = (title: string, doneFn: any) => new Test(title, doneFn)
const passingTest = (title: string) => generateTest(title, () => {})
const failingTest = (title: string) => generateTest(title, () => tDone => tDone(new assert.AssertionError(exampleErrObj)))


describe('Grouped Mocha Test Reporter', () => {

	let mocha: Mocha
	let suite: Mocha.Suite
	let runner: Mocha.Runner
	let mochaReporter: Mocha.Reporter

	describe("0/1 suite tests", () => {
		let subSuite: Mocha.Suite

		beforeEach(() => {

			mocha = new Mocha({
				reporter: MochaGroupedReporter
			})
			suite = new Suite("")
			subSuite = new Suite("Main Group")
			runner = new Runner(suite, false)
			suite.addSuite(subSuite)
			mochaReporter = new (<any>mocha)._reporter(runner, {})
		})

		it('should have 0 passing test if empty suite', function(done) {
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 1 passing test', function(done) {
			const test = passingTest("Passing Test")
			subSuite.addTest(test)
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 7 passing tests', function(done) {
			const nTests = 7
			for (let i: number = 0; i < nTests; i++) {
				subSuite.addTest(passingTest(`passing test ${i}`))
			}
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 0)
				done()
			})
		})

		it('should have 1 failure', function(done) {
			const test = failingTest('failing test')
			subSuite.addTest(test)
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 1)
				done()
			})
		})

		it('should have 7 failing tests', function(done) {
			const nTests = 7
			for (let i: number = 0; i < nTests; i++) {
				subSuite.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 7)
				done()
			})
		})

		it('should have 2 passing, 5 failing tests', function(done) {
			const nPassingTests = 2
			const nFailingTests = 5
			for (let i: number = 0; i < nPassingTests; i++) {
				subSuite.addTest(passingTest(`passing test ${i}`))
			}
			for (let i: number = 0; i < nFailingTests; i++) {
				subSuite.addTest(failingTest(`failing test ${i}`))
			}
			runner.run(failureCount => {
				assert.strictEqual(failureCount, 5)
				done()
			})
		})

	})

	describe("MultiSuite Tests", () => {

		let subSuite1: Mocha.Suite

		beforeEach(() => {
			mocha = new Mocha({
				reporter: MochaGroupedReporter
			})

			suite = new Suite("")
			subSuite1 = new Suite("Group 1")
			runner = new Runner(suite, false)
			suite.addSuite(subSuite1)
			mochaReporter = new (<any>mocha)._reporter(runner, {})

		})

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
