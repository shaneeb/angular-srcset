// Add support for Retina displays when using element attribute "ng-src".
// This module overrides the built-in directive "ng-src" with one which
// distinguishes between standard or high-resolution (Retina) displays.

(function(angular, srcset, undefined) {
'use strict';

var angularSrcset = angular.module('angular-srcset', []).config(function($provide) {
  $provide.decorator('ngSrcsetDirective', ['$delegate', function($delegate) {
    $delegate[0].compile = function(element, attrs) {
      // intentionally empty to override the built-in directive ng-srcset
    };
    return $delegate;
  }]);
});

angularSrcset.directive('ngSrcset', ['$window', function($window) {
  var msie = parseInt(((/msie (\d+)/.exec($window.navigator.userAgent.toLowerCase()) || [])[1]), 10);
  var isResolution2x = (function() {
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), " +
      "(-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)";
    if ($window.devicePixelRatio > 1)
      return true;
    return ($window.matchMedia && $window.matchMedia(mediaQuery).matches);
  })();

  function getImageForDensity(srcset_attr, density) {
    var parsed = srcset.parse(srcset_attr);
    for (var i = 0; i < parsed.length; i++) {
      if (parsed[i].density === density)
        return parsed[i].url;
    }
  }

  return function(scope, element, attrs) {
    function setImgSrc(img_url) {
      attrs.$set('src', img_url);
      if (msie) element.prop('src', img_url);
    }

    attrs.$observe('ngSrcset', function(value) {
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
}]);

})(window.angular, window.srcset);
