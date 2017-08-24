/*!
 * Copyright (c) Naufal Rabbani (http://github.com/BosNaufal)
 * Licensed Under MIT (http://opensource.org/licenses/MIT)
 * 
 * Runner JS @ Version 0.0.1
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Runner"] = factory();
	else
		root["Runner"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.runner = exports.delay = exports.call = undefined;

	var _wrapper = __webpack_require__(1);

	var _runner = __webpack_require__(2);

	var _runner2 = _interopRequireDefault(_runner);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.call = _wrapper.call;
	exports.delay = _wrapper.delay;
	exports.runner = _runner2.default;
	exports.default = _runner2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.call = call;
	exports.delay = delay;

	function destructuring(args) {
	  var func = args[0];
	  args = Array.prototype.slice.call(args, 1, args.length);
	  if (typeof func !== 'function') throw new Error("[Genfunction]: First Argument Should Be a Function");
	  return { func: func, args: args };
	}

	function wrapIt(method, func, args) {
	  return {
	    wrapped: true,
	    method: method,
	    func: func,
	    args: args
	  };
	};

	function call() {
	  var _destructuring = destructuring(arguments),
	      func = _destructuring.func,
	      args = _destructuring.args;

	  return wrapIt("CALL", func, args);
	};

	function delay(time) {
	  return new Promise(function (resolve, reject) {
	    setTimeout(function () {
	      resolve(true);
	    }, time);
	  });
	}

	exports.default = call;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.doPromise = doPromise;
	exports.runGenerator = runGenerator;
	exports.runParallel = runParallel;
	exports.default = sagaRun;

	function isFunction(func) {
	  return typeof func === 'function';
	}

	function isPromise(appliedFunction) {
	  return appliedFunction.then !== undefined;
	}

	function isGeneratorFunction(func) {
	  return typeof func.prototype.next === "function";
	}

	function isArray(arr) {
	  return (typeof arr === 'undefined' ? 'undefined' : _typeof(arr)) === 'object' && arr.length !== 0;
	}

	function doPromise(appliedFunction, done, scope) {
	  var runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction;

	  return appliedFunction.then(function (res) {
	    if (done) return done(res);
	    return runNext(currentRunningFunction, res);
	  });
	}

	// Callback Arguments is indicate that current effectObject is promise or array generator function
	function runGenerator(effectObject, callback, scope) {
	  var sagaRun = scope.sagaRun,
	      runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction,
	      store = scope.store;
	  var method = effectObject.method,
	      func = effectObject.func,
	      args = effectObject.args;

	  if (isFunction(func)) {

	    if (method === "CALL") {
	      var appliedFunction = func.apply(func, args);

	      if (isPromise(appliedFunction)) {
	        return doPromise(appliedFunction, callback, scope);
	      }

	      if (isGeneratorFunction(func)) {
	        return sagaRun(func, store).then(function (res) {
	          if (callback) return callback(res);
	          return runNext(currentRunningFunction, res);
	        });
	      }

	      if (callback) return callback(appliedFunction);
	      return runNext(currentRunningFunction, appliedFunction);
	    }
	  }
	};

	function runParallel(arrayEffectObject, scope) {
	  var runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction;

	  var allResponse = [];
	  var isDone = function isDone() {
	    return allResponse.length === arrayEffectObject.length;
	  };

	  var _loop = function _loop() {
	    var effectObject = arrayEffectObject[i];
	    var index = i;
	    var finish = runGenerator(effectObject, function (res) {
	      allResponse.splice(index, 0, res);
	      if (isDone()) return runNext(currentRunningFunction, allResponse);
	    }, scope);
	  };

	  for (var i = 0; i < arrayEffectObject.length; i++) {
	    _loop();
	  }
	}

	function sagaRun(genFunc) {
	  var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  return new Promise(function (resolve, reject) {

	    var currentRunningFunction = typeof genFunc === "function" ? genFunc(store) : genFunc;

	    function runNext(currentRunningFunction) {
	      var respon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	      var nextRun = currentRunningFunction.next(respon);
	      var effectObject = nextRun.value;
	      var isDone = nextRun.done;

	      var scope = {
	        sagaRun: sagaRun,
	        runNext: runNext,
	        currentRunningFunction: currentRunningFunction,
	        store: store
	      };

	      if (!isDone) {
	        if (!effectObject) {
	          throw new Error('[Redux Runner]: Please wrap the function next to yield statement inside the effects e.g. "call" or "put"');
	        }

	        var isOrdinaryGenFunc = effectObject.func;
	        if (isOrdinaryGenFunc) {
	          return runGenerator(effectObject, false, scope);
	        } else if (isArray(effectObject)) {
	          return runParallel(effectObject, scope);
	        } else {
	          return runNext(currentRunningFunction, effectObject);
	        }
	      } else {
	        resolve(nextRun.value);
	      }
	    }

	    return runNext(currentRunningFunction);
	  });
	};

/***/ })
/******/ ])
});
;