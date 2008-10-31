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
this.jsspec = (function() {
	// host environment
	var host = function() {
		if(this.navigator) {
			// in browser
			return {
				log: function(message) {
					var escaped = (message + '\n').replace(/</img, '&lt;').replace(/\n/img, '<br />');
					document.write(escaped);
				}
			}
		} else if(this.LoadModule) {
			// jshost (jslibs)
			var jshost = {};
			LoadModule.call(jshost, 'jsstd');
			return {
				log: function(message) {
					jshost.Print(message + '\n');
				}
			}
		} else if(this.load) {
			return {
				log: function(message) {
					print(message);
				}
			}
		}
	}();

	
	
	var Runner = function() {
		this.runnable = {};
	};
	Runner.prototype = {
		addScenario: function(scenario) {
			this.runnable[scenario.name] = scenario;
		},
		run: function() {
			for(var name in this.runnable) {
				this.runnable[name].run();
			}
		}
	};
	
	
	
	var TextLogger = function(host) {
		this.host = host;
	}
	TextLogger.prototype.log = function(message) {
		this.host.log(message);
	}
	
	
	var EnglishReporter = function() {}
	EnglishReporter.prototype.report = function(nameOfActual, expected, actual) {
		jsspec.logger.log('- ' + jsspec.currentScenario.name + ': [' + nameOfActual + '] should be [' + expected + '] but [' + actual + ']');
	}
	var KoreanReporter = function() {}
	KoreanReporter.prototype.report = function(nameOfActual, expected, actual) {
		jsspec.logger.log('- ' + jsspec.currentScenario.name + ': [' + nameOfActual + ']의 값은 [' + expected + ']이어야 하지만 [' + actual + ']이기 때문에 실패했습니다.');
	}
	
	
	
	var Scenario = function(name, func) {
		this.name = name;
		this.func = func;
	};
	Scenario.prototype = {
		run: function() {
			jsspec.currentScenario = this;
			try {
				this.func();
			} finally {
				jsspec.currentScenario = null;
			}
		}
	};
	

	
	var context = {};
	
	
	
	var value_of = function(nameOfActual) {
		return {
			should_be: function(expected) {
				var actual = context[nameOfActual];
				if(actual !== expected) {
					jsspec.reporter.report(nameOfActual, expected, actual);
				}
			}
		}
	};
	
	
	
	var bdd_dsl = {
		runner: new Runner(),
		scenario: function(name, func) {this.runner.addScenario(new Scenario(name, func));},
		run: function() {this.runner.run();},
		_: context,
		value_of: value_of
	};
	
	return {
		// classes
		Runner: Runner,
		Scenario: Scenario,
		EnglishReporter: EnglishReporter,
		KoreanReporter: KoreanReporter,
		
		// instances
		context: context,
		value_of: value_of,
		logger: new TextLogger(host),
		reporter: new EnglishReporter(),

		// functions
		switchLogger: function(logger) {
			this._logger = this.logger;
			this.logger = logger;
		},
		restoreLogger: function() {
			this.logger = this._logger;
		},
		switchReporter: function(reporter) {
			this._reporter = this.reporter;
			this.reporter = reporter;
		},
		restoreReporter: function() {
			this.reporter = this._reporter;
		},
		
		// DSLs
		bdd_dsl: bdd_dsl
	};
})();
