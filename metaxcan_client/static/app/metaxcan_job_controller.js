(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "jobService",
            "usSpinnerService",
            metaxcanJobController]);

    function metaxcanJobController($scope, jobService, usSpinnerService){
        var vm = this;
        vm.job = jobService.activeJob;
        vm.parameters =  {};
        vm.message = null;

        vm.start = start

        initialise();

        function initialise() {
            parametersUpdated(jobService.metaxcanParameters);
        }

        function start() {
            usSpinnerService.spin('mp_spinner');
            vm.message = "Updating parameters";
            jobService.updateMetaxcanParameters(vm.parameters).then(updateParametersCallback);
        }

        function updateParametersCallback(result) {
            usSpinnerService.stop("mp_spinner");
            if (result && "message" in result) {
                errorHandler(result);
            } else {
                parametersUpdated(result, "Saved parameters, starting");
                doStart();
            }
        }

       function errorHandler(error) {
            vm.message = error.message;
        }

        function parametersUpdated(parameters, message) {
             vm.parameters = parameters
             vm.message = message ? message : null;
        }

        function doStart() {
            alert("howdy");
        }
    };

})();