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
		prototype[name] = typeof prop[name] == "function" && 
		typeof _super[name] == "function" && fnTest.test(prop[name]) ?
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

jsspec.HostEnvironment = Class.extend({
	log: function(message) {throw "Not implemented";}
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
		var escaped = (message + '\n').replace(/</img, '&lt;').replace(/\n/img, '<br />');
		document.write(escaped);
	}
});
jsspec.RhinoHostEnvironment = jsspec.HostEnvironment.extend({
	log: function(message) {
		print(message);
	}
});
jsspec.WScriptHostEnvironment = jsspec.HostEnvironment.extend({
	log: function(message) {
		WScript.Echo(message);
	}
});



jsspec.Assertion = {
	assertEquals: function(expected, actual) {
		if(expected !== actual) throw 'Expected [' + expected + '] but [' + actual + ']';
	}
}



jsspec.Example = Class.extend({
	init: function(name, func) {
		this.name = name;
		this.func = func;
		this.result = null;
	},
	run: function(reporter) {
		reporter.onExampleStart(this);
		
		var exception = null;
		
		try {
			this.func();
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
	},
	addExample: function(example) {
		this.examples.push(example);
	},
	addExamples: function(examples) {
		for(var i = 0; i < examples.length; i++) {
			this.addExample(examples[i]);
		}
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
			var example = this.getExampleAt(i);
			example.run(reporter);
		}
		
		reporter.onExampleSetEnd(this);
	}
});


jsspec.Result = Class.extend({
	init: function(example, exception) {
		this.example = example;
		this.exception = exception;
	}
});



jsspec.Reporter = Class.extend({
	init: function(host) {
		this.host = host;
	},
	onExampleSetStart: function(exset) {throw "Not implemented";},
	onExampleSetEnd: function(exset) {throw "Not implemented";},
	onExampleStart: function(example) {throw "Not implemented";},
	onExampleEnd: function(example) {throw "Not implemented";}
});

jsspec.ConsoleReporter = jsspec.Reporter.extend({
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
		}
	}
});

jsspec.DummyReporter = jsspec.Reporter.extend({
	init: function() {
		this.log = [];
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

jsspec.host = jsspec.HostEnvironment.getInstance();

jsspec.dsl = {
	TDD: new (Class.extend({
		init: function() {
			this.current = null;
			this.exsets = [];
			this.reporter = new jsspec.ConsoleReporter(jsspec.host);
		},
		suite: function(name) {
			this.current = new jsspec.ExampleSet(name);
			this.exsets.push(this.current);
			return this;
		},
		test: function(name, func) {
			this.current.addExample(new jsspec.Example(name, func));
			return this;
		},
		run: function() {
			for(var i = 0; i < this.exsets.length; i++) {
				this.exsets[i].run(this.reporter);
			}
		},
		assertEquals: jsspec.Assertion.assertEquals
	}))
};



return jsspec;



})();