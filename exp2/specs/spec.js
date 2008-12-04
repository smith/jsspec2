with(jsspec.dsl.TDD) {

suite('Basic Unit Testing APIs')

test('Assertion.assertEquals - success', function() {
	var reporter = new jsspec.DummyReporter();
	var example = new jsspec.Example('Ex1', function() {
		jsspec.Assertion.assertEquals('A', 'A');
	})
	example.run(reporter);
	
	assertEquals(false, !!example.result.exception);
})
test('Assertion.assertEquals - failure', function() {
	var reporter = new jsspec.DummyReporter();
	var example = new jsspec.Example('Ex1', function() {
		jsspec.Assertion.assertEquals('A', 'B');
	})
	example.run(reporter);
	
	assertEquals(true, !!example.result.exception);
})
test('ExampleSet', function() {
	var reporter = new jsspec.DummyReporter();
	
	var exampleSet = new jsspec.ExampleSet('Set1');
	exampleSet.addExample(new jsspec.Example('Ex1', function() {
		jsspec.Assertion.assertEquals('A', 'A');
	}));
	exampleSet.addExample(new jsspec.Example('Ex2', function() {
		jsspec.Assertion.assertEquals('A', 'B');
	}));
	exampleSet.run(reporter);
	
	assertEquals(2, exampleSet.getLength());
	assertEquals(false, !!exampleSet.getExampleAt(0).result.exception);
	assertEquals(true, !!exampleSet.getExampleAt(1).result.exception);
})



suite('Reporter')

test('Callbacks', function() {
	var reporter = new jsspec.DummyReporter();
	
	var exampleSet = new jsspec.ExampleSet('Set1');
	var ex1 = new jsspec.Example('Ex1', function() {});
	var ex2 = new jsspec.Example('Ex2', function() {});
	
	exampleSet.addExample(ex1);
	exampleSet.addExample(ex2);
	exampleSet.run(reporter);
	
	assertEquals(6, reporter.log.length);
	assertEquals('onExampleSetStart', reporter.log[0].op);
	assertEquals(exampleSet, reporter.log[0].exset);
	
	assertEquals('onExampleStart', reporter.log[1].op);
	assertEquals(ex1, reporter.log[1].example);
	
	assertEquals('onExampleEnd', reporter.log[2].op);
	assertEquals(ex1, reporter.log[2].example);
	
	assertEquals('onExampleStart', reporter.log[3].op);
	assertEquals(ex2, reporter.log[3].example);
	
	assertEquals('onExampleEnd', reporter.log[4].op);
	assertEquals(ex2, reporter.log[4].example);
	
	assertEquals('onExampleSetEnd', reporter.log[5].op);
	assertEquals(exampleSet, reporter.log[5].exset);
})



run();

};