/*! angular-srcset - v0.0.1 - 2014-07-05
* https://github.com/shaneeb/angular-srcset
* Copyright (c) 2014 Shaneeb Kamran; Licensed MIT */
/*global window */
(function () {
	'use strict';
	var srcset = {};
	var reInt = /^\d+$/;

	function deepUnique(arr) {
		return arr.sort().filter(function (el, i) {
			return JSON.stringify(el) !== JSON.stringify(arr[i - 1]);
		});
	}

	function unique(arr) {
		return arr.filter(function (el, i) {
			return arr.indexOf(el) === i;
		});
	}

	srcset.parse = function (str) {
		return deepUnique(str.split(',').map(function (el) {
			var ret = {};

			el.trim().split(/\s+/).forEach(function (el, i) {
				if (i === 0) {
					return ret.url = el;
				}

				var value = el.substring(0, el.length - 1);
				var postfix = el[el.length - 1];
				var intVal = parseInt(value, 10);
				var floatVal = parseFloat(value);

				if (postfix === 'w' && reInt.test(value)) {
					ret.width = intVal;
				} else if (postfix === 'h' && reInt.test(value)) {
					ret.height = intVal;
				} else if (postfix === 'x' && !isNaN(floatVal)) {
					ret.density = floatVal;
				} else {
					throw new Error('Invalid srcset descriptor: ' + el + '.');
				}
			});

			return ret;
		}));
	}

	srcset.stringify = function (arr) {
		return unique(arr.map(function (el) {
			if (!el.url) {
				throw new Error('URL is required.');
			}

			var ret = [el.url];

			if (el.width) {
				ret.push(el.width + 'w');
			}

			if (el.height) {
				ret.push(el.height + 'h');
			}

			if (el.density) {
				ret.push(el.density + 'x');
			}

			return ret.join(' ');
		})).join(', ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = srcset;
	} else {
		window.srcset = srcset;
	}
})();

// Add support for Retina displays when using element attribute "ng-src".
// This module overrides the built-in directive "ng-src" with one which
// distinguishes between standard or high-resolution (Retina) displays.
(function (angular, srcset, undefined) {
  'use strict';
  var angularSrcset = angular.module('angular-srcset', []).config([
      '$provide',
      function ($provide) {
        $provide.decorator('ngSrcsetDirective', [
          '$delegate',
          function ($delegate) {
            $delegate[0].compile = function (element, attrs) {
            };
            return $delegate;
          }
        ]);
      }
    ]);
  angularSrcset.directive('ngSrcset', [
    '$window',
    function ($window) {
      var msie = parseInt((/msie (\d+)/.exec($window.navigator.userAgent.toLowerCase()) || [])[1], 10);
      var isResolution2x = function () {
          var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), ' + '(-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
          if ($window.devicePixelRatio > 1)
            return true;
          return $window.matchMedia && $window.matchMedia(mediaQuery).matches;
        }();
      function getImageForDensity(srcset_attr, density) {
        var parsed = srcset.parse(srcset_attr);
        for (var i = 0; i < parsed.length; i++) {
          if (parsed[i].density === density)
            return parsed[i].url;
        }
      }
      return function (scope, element, attrs) {
        function setImgSrc(img_url) {
          attrs.$set('src', img_url);
          if (msie)
            element.prop('src', img_url);
        }
        attrs.$observe('ngSrcset', function (value) {
          if (!value)
            return;
          var image;
          if (isResolution2x && element[0].tagName === 'IMG')
            image = getImageForDensity(value, 2);
          if (!image)
            image = getImageForDensity(value, 1);
          if (image)
            setImgSrc(image);
        });
      };
    }
  ]);
}(window.angular, window.srcset));