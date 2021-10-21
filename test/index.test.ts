import * as assert from "assert"
// import * as childProcess from "child_process"
import Mocha from "mocha"
import MochaGroupedReporter from "../src/index"

const { Runner, Suite, Test } = Mocha

const generateTest = (title: string, doneFn: any) => new Test(title, doneFn)

describe('Grouped Mocha Test Reporter', () => {

	let mocha: Mocha
	let suite: Mocha.Suite
	let subSuite1: Mocha.Suite // A root suite can have multiple grouped suites
	let runner: Mocha.Runner
	let mochaReporter: Mocha.Reporter


	beforeEach(() => {
		mocha = new Mocha({
			reporter: MochaGroupedReporter
		})

		suite = new Suite("Root Suite")
		subSuite1 = new Suite("Group 1")
		runner = new Runner(suite, false)
		suite.addSuite(subSuite1)
		mochaReporter = new (<any>mocha)._reporter(runner, {})

	})

	it('should have 0 passing test in empty suite', function(done) {
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})

	it('should have 1 passing test in 1 suite', function(done) {
		const test = generateTest('passing test', () => { })
		subSuite1.addTest(test)
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})

	it('should have 7 passing tests in 1 suite', function(done) {
		const nTests = 7
		for (let i: number = 0; i < nTests; i++) {
			subSuite1.addTest(generateTest(`passing test ${i}`, () => { }))
		}
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})

	it('should have 1 passing test in 2 suites', function(done) {
		// TODO: Correct subsuite definition
		let subSuite2: Mocha.Suite = new Suite("Group 2")
		suite.addSuite(subSuite2)
		const test = generateTest('passing test', () => { })
		subSuite1.addTest(test)
		subSuite2.addTest(test)

		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})

	it('should have 1 failure in 1 suite', function(done) {
		const error = { expected: 1, actual: 2 }
		const test = generateTest('failing test', tDone => tDone(new assert.AssertionError(error)))
		subSuite1.addTest(test)
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 1)
			done()
		})
	})

	it('should have 7 failing tests in 1 suite', function(done) {
		const nTests = 7
		const error = { expected: 1, actual: 2 }
		for (let i: number = 0; i < nTests; i++) {
			subSuite1.addTest(generateTest(`failing test ${i}`,  tDone => tDone(new assert.AssertionError(error))))
		}
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 7)
			done()
		})
	})

})

const genRandNat = (max: number) => Math.floor(Math.random() * max) + 1
