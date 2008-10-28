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
var jsspec = function() {
	for(var i = 0; i < arguments.length; i += 2) {
		var name = arguments[i];
		var func = arguments[i + 1];
		var example = new jsspec.Example(name, func);
		example.run();
	}
};



jsspec.ConsoleReporter = function() {};
jsspec.ConsoleReporter.prototype = {
	report: function(message) {
		console.log(message);
	}
}



jsspec.NullReporter = function() {};
jsspec.NullReporter.prototype = {
	report: function(message) {}
}



jsspec.ExpectationFailure = function(name, expected, actual) {
	this.name = name;
	this.expected = expected;
	this.actual = actual;
}



jsspec.Value = function(name, value) {
	this.name = name;
	this.value = value;
}
jsspec.Value.prototype = {
	should_be: function(expected) {
		if(this.value === expected) return;
		throw new jsspec.ExpectationFailure(this.name, expected, this.value);
	}
}



jsspec.Example = function(name, func) {
	this.name = name;
	this.func = func;
	this.satisfied = null;
	this.givens = {};
}
jsspec.Example.prototype = {
	addGivenObjects: function(name, objs) {
		this.givens[name] = objs;
	},
	
	run: function(reporter) {
		reporter = reporter || jsspec.options.reporter;
		
		var self = this;
		var context = {};
		for(var name in this.givens) {
			var objs = this.givens[name];
			for(var name in objs) {
				context[name] = new jsspec.Value(name, objs[name]);
			}
		}
		
		var dsl = function(name, value) {
			if(arguments.length === 1) {
				return context[name];
			} else if(arguments.length === 2) {
				context[name] = new jsspec.Value(name, value);
				if(self._currentGiven) self.givens[self._currentGiven][name] = value;
			} else {
				throw 'wrong number of arguments: ' + arguments.length;
			}
		};
		dsl.given = function(name) {
			self.givens[name] = {};
			self._currentGiven = name;
		};
		
		try {
			this.func(dsl);
			this.satisfied = true;
		} catch(e) {
			if(e instanceof jsspec.ExpectationFailure) {
				this.satisfied = false;
				
				reporter.report(this.name + ':\n');
				if(this.givens) {
					for(var name in this.givens) {
						var objs = this.givens[name];
						var message = [];
						for(var oname in objs) message.push(oname + ' ' + objs[oname]);
						reporter.report('- given ' + name + ': ' + message.join(', ') + '\n');
					}
				}
				reporter.report('- ' + e.name + ' should be ' + e.expected + ' but ' + e.actual);
			} else {
				throw e;
			}
		}
	}
}



jsspec.options = {
	reporter: new jsspec.ConsoleReporter()
}