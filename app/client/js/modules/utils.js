App.module('Utils', function (exports) {

  // Much faster than jQuery.data
  exports.data = function (el, name, val) {
    return exports.attr(el, 'data-' + name, val);
  };

  exports.attr = function (el, name, val) {
    if (el && el.jquery) {
      el = el[0];
    }
    // getAttribute/setAttribute = IE 9+
    if (el && el.getAttribute) {
      if (typeof val !== 'undefined') {
        el.setAttribute(name, val);
      } else {
        var attr = el.getAttribute(name);
        return exports.convertNumber(attr);
      }
    }
  };

  exports.convertNumber = function (str) {
    return (str === '' || isNaN(str)) ? str : parseFloat(str);
  };

  exports.strLimit = function (str, limit) {
    limit = limit || 20;
    if (!str || !str.substr) {
      str = str ? (str + '') : '';
    }
    if (str.length < limit - 3) {
      return str;
    }
    return str.substr(0, limit) + '...';
  };

  exports.storage = function (key, value) {
    try {
      key = 'overcast.charts.' + key;

      if (typeof value === 'undefined') {
        return exports.convertNumber(window.localStorage.getItem(key));
      } else {
        if (!_.isString(value)) {
          value = JSON.stringify(value);
        }
        return window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // old browser
    }
  };

});
