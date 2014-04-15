var App = (function () {

  var pub = {};

  pub.module = function (ns, fn) {
    var context = pub;
    var modules = ns.split('.');
    var last = modules.pop();
    for (var i = 0; i < modules.length; i++) {
      context[modules[i]] = context[modules[i]] || {};
      context = context[modules[i]];
    }
    context[last] = context[last] || {};
    var result = fn(context[last]);
    if (typeof result !== 'undefined') {
      context[last] = result;
    }
  };

  return pub;

}());
