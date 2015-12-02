(function(){
    'use strict'

    angular.module('metaxcan_client')
        .directive('convertToNumber', convertToNumber);

    //TODO: move to a directive file
    function convertToNumber() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(val) {
                return parseInt(val, 10);
                });
                ngModel.$formatters.push(function(val) {
                    return '' + val;
                });
            }
        };
    }
})();