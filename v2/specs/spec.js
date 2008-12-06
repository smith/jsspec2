with(jsspec.dsl.TDD) {



suite('Success, failure and error')
	setup(function() {
		this.reporter = new jsspec.DummyReporter();
	})
	test('Normal execution should be treated as a success', function() {
		var example = new jsspec.Example('Ex', function() {/* do nothing */});
		example.run(this.reporter);
		
		assertEquals(true, example.getResult().success());
		assertEquals(false, example.getResult().failure());
		assertEquals(false, example.getResult().error());
	})
	test('Expected exception should be treated as a failure', function() {
		var example = new jsspec.Example('Ex', function() {jsspec.Assertion.assertEquals('A', 'B');})
		example.run(this.reporter);
		
		assertEquals(false, example.getResult().success());
		assertEquals(true, example.getResult().failure());
		assertEquals(false, example.getResult().error());
	})
	test('Unexpected exception should be treated as an error', function() {
		var example = new jsspec.Example('Ex', function() {throw "Unexpected exception";})
		example.run(this.reporter);
		
		assertEquals(false, example.getResult().success());
		assertEquals(false, example.getResult().failure());
		assertEquals(true, example.getResult().error());
	})

suite('Test fixtures')
	setup(function() {
		this.reporter = new jsspec.DummyReporter();
		this.exampleSet = new jsspec.ExampleSet('Set');
	})
	test('Setup and Teardown should be executed for every examples', function() {
		var log = [];
		this.exampleSet.setSetup(function() {log.push('setup');}) 
		this.exampleSet.setTeardown(function() {log.push('teardown');})
		this.exampleSet.addExample(new jsspec.Example('Ex1', function() {log.push('ex1');}));
		this.exampleSet.addExample(new jsspec.Example('Ex2', function() {log.push('ex2');}));
		this.exampleSet.run(this.reporter);
		
		assertEquals(['setup', 'ex1', 'teardown', 'setup', 'ex2', 'teardown'], log);
	})
	test('Teardown should be executed on every condition', function() {
		var log = [];
		this.exampleSet.setTeardown(function() {log.push('teardown');})
		this.exampleSet.addExample(new jsspec.Example('Ex1', function() {jsspec.Assertion.fail();}));
		this.exampleSet.addExample(new jsspec.Example('Ex2', function() {jsspec.Assertion.assertEquals('A', 'B');}));
		this.exampleSet.run(this.reporter);
		
		assertEquals(['teardown', 'teardown'], log);
	})
	test('Context should be bound to [this]', function() {
		var log = [];
		this.exampleSet.setSetup(function() {this.counter = 0; log.push(this.counter++);});
		this.exampleSet.setTeardown(function() {log.push(this.counter++);});
		this.exampleSet.addExample(new jsspec.Example('Ex', function() {log.push(this.counter++);}));
		this.exampleSet.run(this.reporter);
		
		assertEquals([0,1,2], log);
	})
	test('Each test should be executed in isolated context', function() {
		var log = [];
		this.exampleSet.setSetup(function() {
			if(!this.counter) this.counter = 1; else this.counter++;
		});
		this.exampleSet.addExample(new jsspec.Example('Ex1', function() {log.push(this.counter);}));
		this.exampleSet.addExample(new jsspec.Example('Ex2', function() {log.push(this.counter);}));
		this.exampleSet.run(this.reporter);
		
		assertEquals([1, 1], log);
	})

suite('Assertions')
	setup(function() {
		this.e = null;
	})
	test('Assertion.fail', function() {
		try {jsspec.Assertion.fail();} catch(e) {this.e = e;}
		assertEquals(true, this.e instanceof jsspec.ExpectationFailure);
	})
	test('Assertion.assertEquals', function() {
		try {jsspec.Assertion.assertEquals('A', 'A');} catch(e) {this.e = e;}
		assertEquals(null, this.e);
	})
	test('Assertion.assertType', function() {
		jsspec.Assertion.assertType('function', (function() {}));
		jsspec.Assertion.assertType('function', new Function());
		jsspec.Assertion.assertType('string', 'hello');
		jsspec.Assertion.assertType('boolean', false);
		jsspec.Assertion.assertType('number', 1);
		jsspec.Assertion.assertType('array', [1]);
		jsspec.Assertion.assertType('array', new Array());
		jsspec.Assertion.assertType('date', new Date());
		jsspec.Assertion.assertType('regexp', /hello/);
		jsspec.Assertion.assertType('regexp', new RegExp('hello'));
		jsspec.Assertion.assertType('object', {a:1});
	})
	test('Assertion.assertTrue', function() {
		try {jsspec.Assertion.assertTrue(true);} catch(e) {this.e = e;}
		assertEquals(null, this.e);
	})
	test('Assertion.assertFalse', function() {
		try {jsspec.Assertion.assertFalse(false);} catch(e) {this.e = e;}
		assertEquals(null, this.e);
	})

suite('Equality')
	test('Null', function() {
		assertTrue(jsspec.Matcher.getInstance(null, null).matches());
		assertFalse(jsspec.Matcher.getInstance(null, 'A').matches());
		assertFalse(jsspec.Matcher.getInstance('A', null).matches());
	})
	test('Undefined', function() {
		assertTrue(jsspec.Matcher.getInstance(undefined, undefined).matches());
		assertFalse(jsspec.Matcher.getInstance(undefined, 'A').matches());
		assertFalse(jsspec.Matcher.getInstance('A', undefined).matches());
	})
	test('Undefined and Null', function() {
		assertFalse(jsspec.Matcher.getInstance(undefined, null).matches());
		assertFalse(jsspec.Matcher.getInstance(null, undefined).matches());
	})
	test('String', function() {
		assertTrue(jsspec.Matcher.getInstance('A', 'A').matches());
		assertFalse(jsspec.Matcher.getInstance('A', 'B').matches());
	})
	test('Number', function() {
		assertTrue(jsspec.Matcher.getInstance(1, 1).matches());
		assertFalse(jsspec.Matcher.getInstance(1, 2).matches());
	})
	test('Boolean', function() {
		assertTrue(jsspec.Matcher.getInstance(true, true).matches());
		assertFalse(jsspec.Matcher.getInstance(true, false).matches());
	})
	test('Array', function() {
		assertTrue(jsspec.Matcher.getInstance([1,2], [1,2]).matches());
		assertFalse(jsspec.Matcher.getInstance([1,2], [1,3]).matches());
		assertFalse(jsspec.Matcher.getInstance([1,2], [1,2,3]).matches());
	})
	test('Date', function() {
		assertTrue(jsspec.Matcher.getInstance(new Date(1979, 3-1, 27, 0, 0, 0), new Date(1979, 3-1, 27, 0, 0, 0)).matches());
		assertFalse(jsspec.Matcher.getInstance(new Date(1979, 3-1, 27, 0, 0, 0), new Date(1982, 3-1, 2, 0, 0, 0)).matches());
	})
	test('Regexp', function() {
		assertTrue(jsspec.Matcher.getInstance(/A/, /A/).matches());
		assertFalse(jsspec.Matcher.getInstance(/A/, /B/).matches());
	})
	test('Object', function() {
		assertTrue(jsspec.Matcher.getInstance({a:1, b:2}, {a:1, b:2}).matches());
		assertFalse(jsspec.Matcher.getInstance({a:1, b:2}, {a:1, b:3}).matches());
		assertFalse(jsspec.Matcher.getInstance({a:1, b:2}, {a:1, b:2, c:3}).matches());
		assertFalse(jsspec.Matcher.getInstance({a:1, b:2}, {a:1}).matches());
	})
	test('Complex object', function() {
		var expected = {
			arr: ['a', 'b', new Date(1979, 3-1, 27, 0, 0, 0)],
			obj: {x:1, y:2},
			num: 1
		};
		var actual = {
			arr: ['a', 'b', new Date(1979, 3-1, 27, 0, 0, 0)],
			obj: {x:1, y:2},
			num: 1
		};
		
		assertTrue(jsspec.Matcher.getInstance(expected, actual).matches());
		
		actual.obj.y = 3;
		assertFalse(jsspec.Matcher.getInstance(expected, actual).matches());
	})

suite('ExampleSet')
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
		assertEquals(false, !!exampleSet.getExampleAt(0).getResult().getException());
		assertEquals(true, !!exampleSet.getExampleAt(1).getResult().getException());
	})

suite('Reporter')
	test('Callbacks', function() {
		var reporter = new jsspec.DummyReporter();
		
		var exampleSet = new jsspec.ExampleSet('Set1');
		exampleSet.addExample(new jsspec.Example('Ex1', function() {}));
		exampleSet.addExample(new jsspec.Example('Ex2', function() {}));
		
		reporter.onStart();
		exampleSet.run(reporter);
		reporter.onEnd();
		
		assertEquals(
			[
				{op:'onStart'},
				{op:'onExampleSetStart', exset:'Set1'},
				{op:'onExampleStart', example:'Ex1'},
				{op:'onExampleEnd', example:'Ex1'},
				{op:'onExampleStart', example:'Ex2'},
				{op:'onExampleEnd', example:'Ex2'},
				{op:'onExampleSetEnd', exset:'Set1'},
				{op:'onEnd'}
			],
			reporter.log
		);
	})

suite('TODOs')
	test('More API documents', function() {})
	test('Flash/Flex runner', function() {})
	test('Stacktrace', function() {})
	test('Readable failure messages', function() {})
	test('HtmlReporter', function() {})
	test('Conditional execution', function() {})
	test('I18N', function() {})
	test('More assertions', function() {})
	test('DSL for Test-Driven Development', function() {})
	test('DSL for Behavior-Driven Development', function() {})
	test('Plain text runner', function() {})
	test('Theory framework', function() {})
	test('Mock framework', function() {})
	test('Automated continuous testing', function() {})
	test('Circular-reference free matcher', function() {})

run();



};