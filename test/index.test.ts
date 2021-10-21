import * as assert from "assert"
// import * as childProcess from "child_process"
import Mocha from "mocha"
import MochaGroupedReporter from "../src/index"

const { Runner, Suite, Test } = Mocha

const generateTest = (title : string, doneFn : any) => new Test(title, doneFn)

describe('Grouped Mocha Test Reporter', () => {

	let mocha : Mocha
	let suite: Mocha.Suite
	let subSuite: Mocha.Suite
	let runner : Mocha.Runner
	let mochaReporter : Mocha.Reporter


	beforeEach(() => {
		mocha = new Mocha({
			reporter: MochaGroupedReporter
		})
		// mocha.reporter(MochaGroupedReporter, {
		// 	reporterOptions: {
		// 		quiet: true,
		// 	}
		// })

		suite = new Suite('')
		subSuite = new Suite("Mochawesome Suite")
		runner = new Runner(suite, false)
		suite.addSuite(subSuite)
		mochaReporter = new (<any>mocha)._reporter(runner, {})

		// Overwrite `uncaughtEnd` to prevent exit on failure
		// runner.uncaughtEnd = () => { }

	})

	it('should have 0 passing test in empty suite', function(done) {
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})

	it('should have 1 passing test in 1 suite', function(done) {
		const test = generateTest('passing test', () => {})
		subSuite.addTest(test)
		runner.run(failureCount => {
			assert.strictEqual(failureCount, 0)
			done()
		})
	})
})
