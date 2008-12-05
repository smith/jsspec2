/**
 * JSSpec 2
 *
 * Copyright 2007 Alan Kang
 *  - mailto:jania902@gmail.com
 *  - http://jania.pe.kr
 *
 * http://jania.pe.kr/aw/moin.cgi/JSSpec
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,j
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc, 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 */
var jsspec = (function() {



// Simple JavaScript Inheritance from http://ejohn.org/blog/simple-javascript-inheritance/
var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
// The base Class implementation (does nothing)
var Class = function(){};
  
// Create a new Class that inherits from this class
Class.extend = function(prop) {
	var _super = this.prototype;
	    
	// Instantiate a base class (but only create the instance,
	// don't run the init constructor)
	initializing = true;
	var prototype = new this();
	initializing = false;
	
	// Copy the properties over onto the new prototype
	for (var name in prop) {
		// Check if we're overwriting an existing function
		prototype[name] = typeof prop[name] == 'function' && 
		typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
		(function(name, fn){
			return function() {
				var tmp = this._super;
				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = _super[name];
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				var ret = fn.apply(this, arguments);        
				this._super = tmp;
				return ret;
			};
		})(name, prop[name]) :
		prop[name];
	}

	// The dummy class constructor
	function Class() {
		// All construction is actually done in the init method
		if ( !initializing && this.init ) this.init.apply(this, arguments);
	}

	// Populate our constructed prototype object
	Class.prototype = prototype;

	// Enforce the constructor to be what we expect
	Class.constructor = Class;

	// And make this class extendable
	Class.extend = arguments.callee;
	    
	return Class;
};



//root context holder
var root = this;

var jsspec = {};

var EMPTY_FUNCTION = function() {}

jsspec.HostEnvironment = Class.extend({
	log: function(message) {throw 'Not implemented';},
	getDescription: function() {return 'Unknown environment'}
});
jsspec.HostEnvironment.getInstance = function() {
	if(root.navigator) {
		return new jsspec.BrowserHostEnvironment();
	} else if(root.load) {
		return new jsspec.RhinoHostEnvironment();
	} else if(root.WScript) {
		return new jsspec.WScriptHostEnvironment();
	}
}
jsspec.BrowserHostEnvironment = jsspec.HostEnvironment.extend({
	log: function(message) {
		document.title = message;
		
		var escaped = (message + '\n').replace(/</img, '&lt;').replace(/\n/img, '<br />');
		document.write(escaped);
	},
	getDescription: function() {
		return navigator.userAgent;
	}
});
jsspec.RhinoHostEnvironment = jsspec.HostEnvironment.extend({
	log: function(message) {
		print(message);
	},
	getDescription: function() {
		return 'Rhino (Java ' + environment['java.version'] + ')';
	}
});
jsspec.WScriptHostEnvironment = jsspec.HostEnvironment.extend({
	log: function(message) {
		WScript.Echo(message);
	},
	getDescription: function() {
		return 'Windows Script Host ' + WScript.Version;
	}
});



jsspec.ExpectationFailure = Class.extend({
	init: function(message) {
		this.message = message;
	},
	toString: function() {
		return this.message;
	}
});



jsspec.Assertion = {
	fail: function(description) {
		throw new jsspec.ExpectationFailure(description || 'Failed');
	},
	assertEquals: function(expected, actual, description) {
		if(expected !== actual) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	},
	assertType: function(expected, actual, description) {
		var type = jsspec.util.getType(actual);
		if(expected !== type) throw new jsspec.ExpectationFailure((description || 'Type expectation failure') + '. Expected [' + expected + '] but [' + type + ']');
	},
	assertTrue: function(actual, description) {
		var expected = true;
		if(expected !== actual) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	},
	assertFalse: function(actual, description) {
		var expected = false;
		if(expected !== actual) throw new jsspec.ExpectationFailure((description || 'Expectation failure') + '. Expected [' + expected + '] but [' + actual + ']');
	}
};



jsspec.Matcher = Class.extend({
	init: function(expected, actual) {
		this._expected = expected;
		this._actual = actual;
	},
	matches: function() {return this._expected === this._actual;}
});
jsspec.Matcher.getInstance = function(expected, actual) {
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



jsspec.ArrayMatcher = jsspec.Matcher.extend({
	matches: function() {
		if(!this._actual) return false;
		if(this._expected.length !== this._actual.length) return false;
		
		for(var i = 0; i < this._expected.length; i++) {
			var expected = this._expected[i];
			var actual = this._actual[i];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		return true;
	}
});



jsspec.DateMatcher = jsspec.Matcher.extend({
	matches: function() {
		if(!this._actual) return false;
		return this._expected.getTime() === this._actual.getTime();
	}
});



jsspec.RegexpMatcher = jsspec.Matcher.extend({
	matches: function() {
		if(!this._actual) return false;
		return this._expected.source === this._actual.source;
	}
});



jsspec.ObjectMatcher = jsspec.Matcher.extend({
	matches: function() {
		if(!this._actual) return false;

		for(var key in this._expected) {
			var expected = this._expected[key];
			var actual = this._actual[key];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		for(var key in this._actual) {
			var expected = this._actual[key];
			var actual = this._expected[key];
			if(!jsspec.Matcher.getInstance(expected, actual).matches()) return false;
		}
		
		return true;
	}
});



jsspec.Example = Class.extend({
	init: function(name, func) {
		this.name = name;
		this.func = func;
		this.result = null;
	},
	run: function(reporter, context) {
		reporter.onExampleStart(this);
		
		var exception = null;
		
		try {
			this.func.apply(context);
		} catch(e) {
			exception = e;
		}
		
		this.result = new jsspec.Result(this, exception);
		
		reporter.onExampleEnd(this);
	}
});



jsspec.ExampleSet = Class.extend({
	init: function(name, examples) {
		this.name = name;
		this.examples = examples || [];
		this.setup = EMPTY_FUNCTION;
		this.teardown = EMPTY_FUNCTION;
	},
	addExample: function(example) {
		this.examples.push(example);
	},
	addExamples: function(examples) {
		for(var i = 0; i < examples.length; i++) {
			this.addExample(examples[i]);
		}
	},
	setSetup: function(func) {
		this.setup = func;
	},
	setTeardown: function(func) {
		this.teardown = func;
	},
	getLength: function() {
		return this.examples.length;
	},
	getExampleAt: function(index) {
		return this.examples[index];
	},
	run: function(reporter) {
		reporter.onExampleSetStart(this);
		
		for(var i = 0; i < this.getLength(); i++) {
			var context = {};
			
			this.setup.apply(context);
			this.getExampleAt(i).run(reporter, context);
			this.teardown.apply(context);
		}
		
		reporter.onExampleSetEnd(this);
	}
});


jsspec.Result = Class.extend({
	init: function(example, exception) {
		this.example = example;
		this.exception = exception;
	},
	success: function() {
		return !this.exception;
	},
	failure: function() {
		return !this.success() && (this.exception instanceof jsspec.ExpectationFailure);
	},
	error: function() {
		return !this.success() && !(this.exception instanceof jsspec.ExpectationFailure);
	}
});



jsspec.Reporter = Class.extend({
	init: function(host) {
		this.host = host;
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
		this.total = 0;
		this.failures = 0;
		this.errors = 0;
	},
	onStart: function() {
		this.host.log('JSSpec2 on ' + this.host.getDescription());
		this.host.log('');
	},
	onEnd: function() {
		this.host.log('----');
		this.host.log('Total: ' + this.total + ', Failures: ' + this.failures + ', Errors: ' + this.errors + '');
	},
	onExampleSetStart: function(exset) {
		this.host.log('[' + exset.name + ']');
	},
	onExampleSetEnd: function(exset) {
		this.host.log('');
	},
	onExampleStart: function(example) {
		this.host.log(example.name);
	},
	onExampleEnd: function(example) {
		if(example.result.exception) {
			this.host.log('- ' + example.result.exception);
			this.failures++;
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
		this.log.push({op: 'onExampleSetStart', exset:exset});
	},
	onExampleSetEnd: function(exset) {
		this.log.push({op: 'onExampleSetEnd', exset:exset});
	},
	onExampleStart: function(example) {
		this.log.push({op: 'onExampleStart', example:example});
	},
	onExampleEnd: function(example) {
		this.log.push({op: 'onExampleEnd', example:example});
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



jsspec.host = jsspec.HostEnvironment.getInstance();



jsspec.dsl = {
	TDD: new (Class.extend({
		init: function() {
			this._current = null;
			this._exsets = [];
			this._reporter = new jsspec.ConsoleReporter(jsspec.host);
		},
		suite: function(name) {
			this._current = new jsspec.ExampleSet(name);
			this._exsets.push(this._current);
			return this;
		},
		test: function(name, func) {
			this._current.addExample(new jsspec.Example(name, func));
			return this;
		},
		setup: function(func) {
			this._current.setSetup(func);
		},
		teardown: function(func) {
			this._current.setTeardown(func);
		},
		run: function() {
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



return jsspec;



})();