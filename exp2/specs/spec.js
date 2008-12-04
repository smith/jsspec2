jsspec.dsl.TDD({

'Basic Unit Testing APIs': {
	'Assertion.assertEquals - success': function() {
		var reporter = new jsspec.DummyReporter();
		var example = new jsspec.Example('Ex1', function() {
			jsspec.Assertion.assertEquals('A', 'A');
		})
		example.run(reporter);
		
		jsspec.Assertion.assertEquals(false, !!example.result.exception);
	},
	'Assertion.assertEquals - failure': function() {
		var reporter = new jsspec.DummyReporter();
		var example = new jsspec.Example('Ex1', function() {
			jsspec.Assertion.assertEquals('A', 'B');
		})
		example.run(reporter);
		
		jsspec.Assertion.assertEquals(true, !!example.result.exception);
	},
	'ExampleSet': function() {
		var reporter = new jsspec.DummyReporter();
		
		var exampleSet = new jsspec.ExampleSet('Set1');
		exampleSet.addExample(new jsspec.Example('Ex1', function() {
			jsspec.Assertion.assertEquals('A', 'A');
		}));
		exampleSet.addExample(new jsspec.Example('Ex2', function() {
			jsspec.Assertion.assertEquals('A', 'B');
		}));
		exampleSet.run(reporter);
		
		jsspec.Assertion.assertEquals(2, exampleSet.getLength());
		jsspec.Assertion.assertEquals(false, !!exampleSet.getExampleAt(0).result.exception);
		jsspec.Assertion.assertEquals(true, !!exampleSet.getExampleAt(1).result.exception);
	}
},
'Reporter': {
  	'Callbacks': function() {
  		var reporter = new jsspec.DummyReporter();
  		
  		var exampleSet = new jsspec.ExampleSet('Set1');
  		var ex1 = new jsspec.Example('Ex1', function() {});
  		var ex2 = new jsspec.Example('Ex2', function() {});
  		
  		exampleSet.addExample(ex1);
  		exampleSet.addExample(ex2);
  		exampleSet.run(reporter);
  		
		jsspec.Assertion.assertEquals(6, reporter.log.length);
		jsspec.Assertion.assertEquals('onExampleSetStart', reporter.log[0].op);
		jsspec.Assertion.assertEquals(exampleSet, reporter.log[0].exset);
		
		jsspec.Assertion.assertEquals('onExampleStart', reporter.log[1].op);
		jsspec.Assertion.assertEquals(ex1, reporter.log[1].example);
		
		jsspec.Assertion.assertEquals('onExampleEnd', reporter.log[2].op);
		jsspec.Assertion.assertEquals(ex1, reporter.log[2].example);
		
		jsspec.Assertion.assertEquals('onExampleStart', reporter.log[3].op);
		jsspec.Assertion.assertEquals(ex2, reporter.log[3].example);
		
		jsspec.Assertion.assertEquals('onExampleEnd', reporter.log[4].op);
		jsspec.Assertion.assertEquals(ex2, reporter.log[4].example);
		
		jsspec.Assertion.assertEquals('onExampleSetEnd', reporter.log[5].op);
		jsspec.Assertion.assertEquals(exampleSet, reporter.log[5].exset);
  	}
}

});