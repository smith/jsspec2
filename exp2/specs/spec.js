with(jsspec.dsl.TDD) {

suite('Assertion API')

test('Unconditional failure', function() {
	assertEquals(true, !!jsspec.Assertion.fail);
	
	var failed = false;
	try {
		jsspec.Assertion.fail();
	} catch(expected) {
		failed = true;
	}
	
	assertEquals(failed, true);
})
test('Equality', function() {
	var failed = false;
	try {
		jsspec.Assertion.assertEquals('A', 'A');
	} catch(e) {
		failed = true;
	}
	assertEquals(false, failed);
})
test('Equality failure', function() {
	var failed = false;
	try {
		jsspec.Assertion.assertEquals('A', 'B');
	} catch(expected) {
		failed = true;
	}
	assertEquals(true, failed);
})
test('Type assertions for native types', function() {
	assertEquals(true, !!jsspec.Assertion.assertType);
	
	assertType('function', (function() {}));
	assertType('function', new Function());
	assertType('string', 'hello');
	assertType('boolean', false);
	assertType('number', 1);
	assertType('array', [1]);
	assertType('array', new Array());
	assertType('date', new Date());
	assertType('regexp', /hello/);
	assertType('regexp', new RegExp('hello'));
	assertType('object', {a:1});
})



suite('Organization')

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
	
	reporter.onStart();
	exampleSet.run(reporter);
	reporter.onEnd();
	
	assertEquals(8, reporter.log.length);
	assertEquals('onStart', reporter.log[0].op);
	
	assertEquals('onExampleSetStart', reporter.log[1].op);
	assertEquals(exampleSet, reporter.log[1].exset);
	
	assertEquals('onExampleStart', reporter.log[2].op);
	assertEquals(ex1, reporter.log[2].example);
	
	assertEquals('onExampleEnd', reporter.log[3].op);
	assertEquals(ex1, reporter.log[3].example);
	
	assertEquals('onExampleStart', reporter.log[4].op);
	assertEquals(ex2, reporter.log[4].example);
	
	assertEquals('onExampleEnd', reporter.log[5].op);
	assertEquals(ex2, reporter.log[5].example);
	
	assertEquals('onExampleSetEnd', reporter.log[6].op);
	assertEquals(exampleSet, reporter.log[6].exset);

	assertEquals('onEnd', reporter.log[7].op);
})



run();

};