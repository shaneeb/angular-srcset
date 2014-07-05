'use strict';

describe('test module angular-retina', function() {
  var $window;

  describe('on high resolution displays', function() {
    var scope;

    beforeEach(function() {
      module(function($provide) {
        $provide.provider('$window', function() {
          this.$get = function() {
            try {
              window.devicePixelRatio = 2;
            } catch (TypeError) {
              // in Firefox window.devicePixelRatio only has a getter
            }
            window.matchMedia = function(query) {
              return {matches: true};
            };
            return window;
          };
        });
      });
      module('angular-srcset');
    });

    beforeEach(inject(function($injector, $rootScope) {
      scope = $rootScope.$new();
    }));

    describe('for static "ng-srcset" tags', function() {
      it('should set src tag with a high resolution image', inject(function($compile) {
        var element = angular.element('<img ng-srcset="image.png 1x, image_2x.png 2x">');
        $compile(element)(scope);
        scope.$digest();
        expect(element.attr('src')).toBe('image_2x.png');
      }));
    });

    describe('for marked up "ng-srcset" tags', function() {
      var element;

      beforeEach(inject(function($compile) {
        element = angular.element('<img ng-srcset="{{image_url}} 1x, {{image_url_2x}} 2x">');
        scope.image_url = 'image.png';
        scope.image_url_2x = 'image_2x.png';
        $compile(element)(scope);
        scope.$digest();
      }));

      it('should set src tag with a high resolution image', function() {
        expect(element.attr('src')).toBe('image_2x.png');
      });

      describe('should observe scope', function() {
        beforeEach(function() {
          scope.image_url_2x = 'picture.png';
          scope.$digest();
        });

        it('and replace src tag with another image', function() {
          expect(element.attr('src')).toBe('picture.png');
        });
      });
    });

    describe('if only low resolution image is provided', function() {
      it('should set src tag with a low resolution image', inject(function($compile) {
        var element = angular.element('<img ng-srcset="image.png 1x">');
        $compile(element)(scope);
        scope.$digest();
        expect(element.attr('src')).toBe('image.png');
      }));

      it('should set src tag with a low resolution image using interpolation', inject(function($compile) {
        var element = angular.element('<img ng-srcset="{{image_url}} 1x">');
        scope.image_url = 'image.png';
        $compile(element)(scope);
        scope.$digest();
        expect(element.attr('src')).toBe('image.png');
      }));
    });
  });

  describe('on low resolution displayes', function() {
    var scope;

    beforeEach(function() {
      module(function($provide) {
        $provide.provider('$window', function() {
          this.$get = function() {
            try {
              window.devicePixelRatio = 1;
            } catch (TypeError) {
              // in Firefox window.devicePixelRatio only has a getter
            }
            window.matchMedia = function(query) {
              return {matches: false};
            };
            return window;
          };
        });
      });
      module('angular-srcset');
    });

    beforeEach(inject(function($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should set src tag with a low resolution image', inject(function($compile) {
      var element = angular.element('<img ng-srcset="image.png 1x, image_2x.png 2x">');
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('image.png');
    }));

    it('should set src tag with a low resolution image using interpolation', inject(function($compile) {
      var element = angular.element('<img ng-srcset="{{image_url}} 1x">');
      scope.image_url = 'image.png';
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('image.png');
    }));
  });

});
