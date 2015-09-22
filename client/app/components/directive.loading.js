(function () {
    'use strict'

    angular
        .module('d3dps')
        .directive('loading', ['$http', loadingAnimation]);

    function loadingAnimation($http) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {

                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v) {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            }
        };
    }
})();
