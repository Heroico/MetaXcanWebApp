(function(){
    angular.module('metaxcanClientServices')
        .factory('fileService', ['$rootScope', 'Upload', 'userService', fileService])

    /**
     *This is a service meant to help other services. Not thought for controller friendliness.
     */
    function fileService($rootScope, Upload, userService){
        var service = {}

        initialise();

        return service;

        function initialise() {
        }
     }
})();