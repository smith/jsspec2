jsspec(
	'Empty example should success', function(_) {
		var example = new jsspec.Example('Example', function(_) {});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(true);
	},
	
	'Empty example should success', function(_) {
		var example = new jsspec.Example('Example', function(_) {});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(true);
	},
	
	'Simple expectation', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_.given('number');
				_('odd', 1);
			
			_('odd').should_be(1);
		});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(true);
	},
	
	'Expectation failure', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_.given('number');
				_('odd', 2);
			
			_('odd').should_be(1);
		});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(false);
	},
	
	'Second expectation failure', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_.given('two numbers');
				_('odd', 1);
				_('even', 1);
			
			_('odd').should_be(1);
			_('even').should_be(2);
		});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(false);
	},

	'First expectation failure', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_.given('two numbers');
				_('odd', 2);
				_('even', 2);

			_('odd').should_be(1);
			_('even').should_be(2);
		});
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(false);
	},

	'Reporter', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_.given('number');
				_('odd', 2);

			_('odd').should_be(1);
		});
		var log = [];
		var reporter = {
			report: function(message) {log.push(message)}
		};
		example.run(reporter);
		_('message', log.join(''));
		_('message').should_be(
			'Example:\n' +
			'- given number: odd 2\n' + 
			'- odd should be 1 but 2'
		);
	},
	
	'Givens', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_('odd').should_be(1);
			_('even').should_be(2);
		});
		example.addGivenObjects('two numbers', {'odd': 1, 'even': 2});
		
		example.run(new jsspec.NullReporter());
		_('satisfied', example.satisfied);
		_('satisfied').should_be(true);
	},
	
	'Report for givens', function(_) {
		var example = new jsspec.Example('Example', function(_) {
			_('odd').should_be(1);
			_('even').should_be(2);
		});
		example.addGivenObjects('two numbers', {'odd': 1, 'even': 1});
		var log = [];
		var reporter = {
			report: function(message) {log.push(message)}
		};
		example.run(reporter);
		_('message', log.join(''));
		_('message').should_be(
			'Example:\n' +
			'- given two numbers: odd 1, even 1\n' +
			'- even should be 2 but 1'
		);
	},
	
	'Test': function(_) {
		_.given('Wrong odd number'):
			_('odd', 2);
		
		_.when('divide by 2');
			_('odd')
	}
);