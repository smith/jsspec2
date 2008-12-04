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



// root context holder
var root = this;

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



var HostEnvironment = Class.extend({
	log: function(message) {throw "Not implemented";}
});
HostEnvironment.getInstance = function() {
	if(root.navigator) {
		return new BrowserHostEnvironment();
	} else if(root.load) {
		return new RhinoHostEnvironment();
	}
}
var BrowserHostEnvironment = HostEnvironment.extend({
	log: function(message) {
		var escaped = (message + '\n').replace(/</img, '&lt;').replace(/\n/img, '<br />');
		document.write(escaped);
	}
});
var RhinoHostEnvironment = HostEnvironment.extend({
	log: function(message) {
		print(message);
	}
});



return {
	host: HostEnvironment.getInstance()
}



})();
