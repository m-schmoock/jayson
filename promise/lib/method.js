var _ = require('lodash');
var jayson = require('../../');

/**
 * Constructor for a Jayson Promise Method
 * @see Method
 * @class PromiseMethod
 * @extends Method
 * @return {PromiseMethod}
 * @api public
 */
var PromiseMethod = module.exports = function(handler, options) {
  if(!(this instanceof PromiseMethod)) {
    return new PromiseMethod(handler, options);
  }
  jayson.Method.apply(this, arguments);
};
require('util').inherits(PromiseMethod, jayson.Method);

module.exports = PromiseMethod;

/**
 * @summary Executes this method in the context of a server
 * @param {ServerHttp} server
 * @param {Array|Object} params
 * @param {Function} outerCallback
 */
PromiseMethod.prototype.execute = function(server, params, outerCallback) {
  var options = this.options;
  var wasPromised = false;

  var promise = jayson.Method.prototype.execute.call(this, server, params, function() {
    if(wasPromised) return; // ignore any invocations of the callback if a promise was returned
    outerCallback.apply(null, arguments);
  });

  wasPromised = promise instanceof Promise;

  // if the handler returned a promise, call the callback when it resolves
  if(wasPromised) {
    return promise.then(
      function(fulfilled) { outerCallback(null, fulfilled); },
      function(rejected) { outerCallback(rejected); }
    );
  }
};