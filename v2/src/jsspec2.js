/**
 * @namespace Single namespace that contains all classes and functions of jsspec
 */
var jsspec = {};



/**
 * @class Base class to emulate classical class-based OOP
 */
jsspec.Class = function() {};
jsspec.Class._initializing = false;
jsspec.Class._fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

/**
 * @param {object} base Base class to be extended
 * @return {jsspec.Class} Extended class instance
 */
jsspec.Class.extend = function(base) {
	// Inspired by http://ejohn.org/blog/simple-javascript-inheritance/
	var _super = this.prototype;
	
	jsspec.Class._initialiing = true;
	var prototype = new this();
	jsspec.Class._initialiing = false;
	
	for(var name in base) {
		prototype[name] = typeof base[name] == 'function' && 
		typeof _super[name] == 'function' && jsspec.Class._fnTest.test(base[name]) ?
		(function(name, fn){
			return function() {
				var tmp = this._super;
				this._super = _super[name];
				var ret = fn.apply(this, arguments);        
				this._super = tmp;
				return ret;
			};
		})(name, base[name]) :
		base[name];
	}

	function Class() {
		if ( !jsspec.Class._initializing && this.init ) this.init.apply(this, arguments);
	}

	Class.prototype = prototype;
	Class.constructor = Class;
	Class.extend = arguments.callee;
	
	return Class;
};



/**
 * @class Encapsulates differences of various host environments
 * @extends jsspec.Class
 */
jsspec.HostEnvironment = jsspec.Class.extend(/** @lends jsspec.HostEnvironment.prototype */{
	/**
	 * Prints single line message to console
	 * 
	 * @param {string} message A message to print
	 */
	log: function(message) {throw 'Not implemented';},
	
	/**
	 * @return {string} Short description of current host environment
	 */
	getDescription: function() {return 'Unknown environment'},
	
	/**
	 * Loads and execute script
	 * 
	 * @param {string} path Relative path
	 */
	loadScript: function(path) {return 'Not implemented';}
});

/**
 * Static factory
 * 
 * @returns {jsspec.HostEnvironment} Platform specific instance
 */
jsspec.HostEnvironment.getInstance = function() {
	if(jsspec.root.navigator) {
		return new jsspec.BrowserHostEnvironment();
	} else if(jsspec.root.load) {
		return new jsspec.RhinoHostEnvironment();
	} else if(jsspec.root.WScript) {
		return new jsspec.WScriptHostEnvironment();
	}
}



/**
 * @class Browser host environment
 * @extends jsspec.HostEnvironment
 */
jsspec.BrowserHostEnvironment = jsspec.HostEnvironment.extend(/** @lends jsspec.BrowserHostEnvironment.prototype */{
	log: function(message) {
		jsspec.root.document.title = message;
		
		var escaped = (message + '\n').replace(/</img, '&lt;').replace(/\n/img, '<br />');
		jsspec.root.document.write(escaped);
	},
	getDescription: function() {
		return jsspec.root.navigator.userAgent;
	},
	loadScript: function(path) {
		var base = this._findBasePath();
		jsspec.root.document.write('<script type="text/javascript" src="' + base + path + '"></script>');
	},
	_findBasePath: function() {
		var scripts = document.getElementsByTagName("script");
		for(var i = 0; i < scripts.length; i++) {
			var script = scripts[i];
			if(script.src && script.src.match(/jsspec2\.js/i)) {
				return script.src.match(/(.*\/)jsspec2\.js.*/i)[1];
			}
		}
		return './';
	}
});



/**
 * @class Rhino host environment
 * @extends jsspec.HostEnvironment
 */
jsspec.RhinoHostEnvironment = jsspec.HostEnvironment.extend(/** @lends jsspec.RhinoHostEnvironment.prototype */{
	log: function(message) {
		jsspec.root.print(message);
	},
	getDescription: function() {
		return 'Rhino (Java ' + jsspec.root.environment['java.version'] + ')';
	},
	loadScript: function(path) {
		var base = this._findBasePath();
		jsspec.root.load(base + path);
	},
	_findBasePath: function() {
		return jsspec.root.environment['user.dir'] + jsspec.root.environment['file.separator'];
	}
});



/**
 * @class Windows Script host environment
 * @extends jsspec.HostEnvironment
 */
jsspec.WScriptHostEnvironment = jsspec.HostEnvironment.extend(/** @lends jsspec.WScriptHostEnvironment.prototype */{
	log: function(message) {
		jsspec.root.WScript.Echo(message);
	},
	getDescription: function() {
		return 'Windows Script Host ' + WScript.Version;
	},
	loadScript: function(path) {
		var base = this._findBasePath();
		var script = this._readFile(base + path);
		
		// evaluate script in global context
		jsspec.root._tmp = function() {eval(script);};
		delete jsspec.root._tmp;
	},
	_readFile: function(path) {
		var fso = new jsspec.root.ActiveXObject('Scripting.FileSystemObject');
		var file;
		try {
			file = fso.OpenTextFile(path);
			return file.ReadAll();
		} finally {
			try {if(file) file.Close();} catch(ignored) {}
		}
	},
	_findBasePath: function() {
		return '.';
	}
});



/**
 * @class Collection of assertion APIs
 */
jsspec.Assertion = {
	/**
	 * Makes an example fail unconditionally
	 * 
	 * @param {string} [description] Optional description
	 */
	fail: function(description) {
		throw new jsspec.ExpectationFailure(description || 'Failed');
	},
	
	/**
	 * Performs equality test
	 * 
	 * @param {object} expected Expected value
	 * @param {object} actual Actual value
	 * @param {string} [description] Optional description
	 */
	assertEquals: function(expected, actual, description) {
		var matcher = jsspec.Matcher.getInstance(expected, actual);
		if(!matcher.matches()) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	},
	
	/**
	 * Performs type test
	 * 
	 * @param {string} expected Expected type
	 * @param {object} actual Actual object
	 * @param {string} [description] Optional description
	 */
	assertType: function(expected, actual, description) {
		var type = jsspec.util.getType(actual);
		if(expected !== type) throw new jsspec.ExpectationFailure((description || 'Type expectation failure') + '. Expected [' + expected + '] but [' + type + ']');
	},
	
	/**
	 * Checks if given value is true
	 * 
	 * @param {boolean} actual Actual object
	 * @param {string} [description] Optional description
	 */
	assertTrue: function(actual, description) {
		var expected = true;
		if(expected !== actual) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	},
	
	/**
	 * Checks if given value is false
	 * 
	 * @param {boolean} actual Actual object
	 * @param {string} [description] Optional description
	 */
	assertFalse: function(actual, description) {
		var expected = false;
		if(expected !== actual) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	}
};



/**
 * @class Exception class to represent expectation failure (instead of error)
 * @extends jsspec.Class
 */
jsspec.ExpectationFailure = jsspec.Class.extend(/** @lends jsspec.ExpectationFailure.prototype */{
	/**
	 * @constructs
	 * @param {string} message An failure message
	 */
	init: function(message) {
		this._message = message;
	},
	toString: function() {
		return this._message;
	}
});



/**
 * @class Performs equality check for given objects
 * @extends jsspec.Class
 */
jsspec.Matcher = jsspec.Class.extend(/** @lends jsspec.Matcher.prototype */{
	/**
	 * @constructs
	 * @param {object} expected An expected object
	 * @param {object} actual An actual object
	 */
	init: function(expected, actual) {
		this._expected = expected;
		this._actual = actual;
	},
	
	/**
	 * @returns {object} An expected object
	 */
	getExpected: function() {return this._expected;},
	
	/**
	 * @returns {object} An actual object
	 */
	getActual: function() {return this._actual;},
	
	/**
	 * @param {boolean} True if matches
	 */
	matches: function() {return this.getExpected() === this.getActual();}
});

/**
 * Returns appropriate jsspec.Matcher instance for given parameters' type
 * 
 * @param {object} expected An expected object
 * @param {object} actual An actual object
 * @returns {jsspec.Matcher} An instance of jsspec.Matcher
 */
jsspec.Matcher.getInstance = function(expected, actual) {
	if(expected === null || expected === undefined) return new jsspec.Matcher(expected, actual);
	
	var type = jsspec.util.getType(expected);
	var clazz = null;
	
	if('array' === type) {
		clazz = jsspec.ArrayMatcher;
	} else if('date' === type) {
		clazz = jsspec.DateMatcher;
	} else if('regexp' === type) {
		clazz = jsspec.RegexpMatcher;
	} else if('object' === type) {
		clazz = jsspec.ObjectMatcher;
	} else { // if string, boolean, number, function and anything else
		clazz = jsspec.Matcher;
	}
	
	return new clazz(expected, actual);
};



/**
 * @class Performs equality check for two arrays
 * @extends jsspec.Matcher
 */
jsspec.ArrayMatcher = jsspec.Matcher.extend(/** @lends jsspec.ArrayMatcher.prototype */{
	matches: function() {
		if(!this.getActual()) return false;
		if(this.getExpected().length !== this.getActual().length) return false;
		
		for(var i = 0; i < this.getExpected().length; i++) {
			var expected = this.getExpected()[i];
			var actual = this.getActual()[i];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		return true;
	}
});



/**
 * @class Performs equality check for two date instances
 * @extends jsspec.Matcher
 */
jsspec.DateMatcher = jsspec.Matcher.extend(/** @lends jsspec.DateMatcher.prototype */{
	matches: function() {
		if(!this.getActual()) return false;
		return this.getExpected().getTime() === this.getActual().getTime();
	}
});



/**
 * @class Performs equality check for two regular expressions
 * @extends jsspec.Matcher
 */
jsspec.RegexpMatcher = jsspec.Matcher.extend(/** @lends jsspec.RegexpMatcher.prototype */{
	matches: function() {
		if(!this.getActual()) return false;
		return this.getExpected().source === this.getActual().source;
	}
});



/**
 * @class Performs equality check for two objects
 * @extends jsspec.Matcher
 */
jsspec.ObjectMatcher = jsspec.Matcher.extend(/** @lends jsspec.ObjectMatcher.prototype */{
	matches: function() {
		if(!this.getActual()) return false;

		for(var key in this.getExpected()) {
			var expected = this.getExpected()[key];
			var actual = this.getActual()[key];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		for(var key in this.getActual()) {
			var expected = this.getActual()[key];
			var actual = this.getExpected()[key];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		return true;
	}
});



jsspec.Example = jsspec.Class.extend({
	init: function(name, func) {
		this._name = name;
		this._func = func;
		this._result = null;
	},
	
	getName: function() {return this._name;},
	getFunction: function() {return this._func;},
	getResult: function() {return this._result;},
	
	run: function(reporter, context) {
		reporter.onExampleStart(this);
		
		var exception = null;
		
		try {
			this.getFunction().apply(context);
		} catch(e) {
			exception = e;
		}
		
		this._result = new jsspec.Result(this, exception);
		
		reporter.onExampleEnd(this);
	}
});



jsspec.ExampleSet = jsspec.Class.extend({
	init: function(name, examples) {
		this._name = name;
		this._examples = examples || [];
		this._setup = jsspec._EMPTY_FUNCTION;
		this._teardown = jsspec._EMPTY_FUNCTION;
	},
	getName: function() {return this._name;},
	getSetup: function() {return this._setup;},
	getTeardown: function() {return this._teardown;},
	
	addExample: function(example) {
		this._examples.push(example);
	},
	addExamples: function(examples) {
		for(var i = 0; i < examples.length; i++) {
			this.addExample(examples[i]);
		}
	},
	setSetup: function(func) {
		this._setup = func;
	},
	setTeardown: function(func) {
		this._teardown = func;
	},
	getLength: function() {
		return this._examples.length;
	},
	getExampleAt: function(index) {
		return this._examples[index];
	},
	run: function(reporter) {
		reporter.onExampleSetStart(this);
		
		for(var i = 0; i < this.getLength(); i++) {
			var context = {};
			
			this.getSetup().apply(context);
			this.getExampleAt(i).run(reporter, context);
			this.getTeardown().apply(context);
		}
		
		reporter.onExampleSetEnd(this);
	}
});


jsspec.Result = jsspec.Class.extend({
	init: function(example, exception) {
		this._example = example;
		this._exception = exception;
	},
	
	getExample: function() {return this._example;},
	getException: function() {return this._exception;},
	
	success: function() {
		return !this.getException();
	},
	failure: function() {
		return !this.success() && (this.getException() instanceof jsspec.ExpectationFailure);
	},
	error: function() {
		return !this.success() && !(this.getException() instanceof jsspec.ExpectationFailure);
	}
});



jsspec.Reporter = jsspec.Class.extend({
	init: function(host) {
		this._host = host;
	},
	onStart: function() {throw 'Not implemented';},
	onEnd: function() {throw 'Not implemented';},
	onExampleSetStart: function(exset) {throw 'Not implemented';},
	onExampleSetEnd: function(exset) {throw 'Not implemented';},
	onExampleStart: function(example) {throw 'Not implemented';},
	onExampleEnd: function(example) {throw 'Not implemented';}
});

jsspec.ConsoleReporter = jsspec.Reporter.extend({
	init: function(host) {
		this._super(host);
		this._total = 0;
		this._failures = 0;
		this._errors = 0;
	},
	onStart: function() {
		this._host.log('JSSpec2 on ' + this._host.getDescription());
		this._host.log('');
	},
	onEnd: function() {
		this._host.log('----');
		this._host.log('Total: ' + this._total + ', Failures: ' + this._failures + ', Errors: ' + this._errors + '');
	},
	onExampleSetStart: function(exset) {
		this._host.log('[' + exset.getName() + ']');
	},
	onExampleSetEnd: function(exset) {
		this._host.log('');
	},
	onExampleStart: function(example) {
		this._host.log(example.getName());
	},
	onExampleEnd: function(example) {
		this._total++;
		
		var result = example.getResult();
		if(result.success()) return;
		
		this._host.log('- ' + result.getException());
		if(result.failure()) {
			this._failures++;
		} else {
			this._errors++;
		}
	}
});

jsspec.DummyReporter = jsspec.Reporter.extend({
	init: function() {
		this.log = [];
	},
	onStart: function() {
		this.log.push({op: 'onStart'});
	},
	onEnd: function() {
		this.log.push({op: 'onEnd'});
	},
	onExampleSetStart: function(exset) {
		this.log.push({op: 'onExampleSetStart', exset:exset.getName()});
	},
	onExampleSetEnd: function(exset) {
		this.log.push({op: 'onExampleSetEnd', exset:exset.getName()});
	},
	onExampleStart: function(example) {
		this.log.push({op: 'onExampleStart', example:example.getName()});
	},
	onExampleEnd: function(example) {
		this.log.push({op: 'onExampleEnd', example:example.getName()});
	}
});



jsspec.util = {
	getType: function(o) {
		var ctor = o.constructor;
		
		if(ctor == Array) {
			return 'array';
		} else if(ctor == Date) {
			return 'date';
		} else if(ctor == RegExp) {
			return 'regexp';
		} else {
			return typeof o;
		}
	}
}


jsspec.dsl = {
	TDD: new (jsspec.Class.extend({
		init: function() {
			this._current = null;
			this._exsets = [];
		},
		suite: function(name) {
			this._current = new jsspec.ExampleSet(name);
			this._exsets.push(this._current);
			return this;
		},
		test: function(name, func) {
			if(!this._current) {
				this.suite('Default example set');
			}
			
			this._current.addExample(new jsspec.Example(name, func));
			return this;
		},
		setup: function(func) {
			if(!this._current) {
				this.suite('Default example set');
			}

			this._current.setSetup(func);
		},
		teardown: function(func) {
			if(!this._current) {
				this.suite('Default example set');
			}
			
			this._current.setTeardown(func);
		},
		run: function() {
			this._reporter = new jsspec.ConsoleReporter(jsspec.host);
			
			this._reporter.onStart();
			
			for(var i = 0; i < this._exsets.length; i++) {
				this._exsets[i].run(this._reporter);
			}
			
			this._reporter.onEnd();
			
			return this;
		},
		fail: jsspec.Assertion.fail,
		assertEquals: jsspec.Assertion.assertEquals,
		assertType: jsspec.Assertion.assertType,
		assertTrue: jsspec.Assertion.assertTrue,
		assertFalse: jsspec.Assertion.assertFalse
	}))
};




jsspec.root = this;
jsspec._EMPTY_FUNCTION = function() {}
jsspec.host = jsspec.HostEnvironment.getInstance();
