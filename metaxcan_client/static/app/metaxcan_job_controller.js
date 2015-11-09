(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "$location", "usSpinnerService",
            "jobService", "transcriptomeService", "paths",
            metaxcanJobController]);

    function metaxcanJobController($scope, $location, usSpinnerService,
                jobService, transcriptomeService, paths){
        var vm = this;
        vm.job = jobService.activeJob;
        vm.parameters =  {};
        vm.message = null;
        vm.transcriptomes = null;

        vm.start = start

        initialise();

        function initialise() {
            if (jobService.activeJob == null) {
                $location.path(paths.home);
                return
            }

            vm.transcriptomes = transcriptomeService.transcriptomes;
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

             if (vm.parameters.transcriptome == null) {
                var t = vm.transcriptomes[0];
                vm.parameters.transcriptome = t.id;
             }
        }

        function doStart() {
            alert("howdy");
        }
    };

})();