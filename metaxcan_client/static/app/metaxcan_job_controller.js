(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "$location", "$timeout", "usSpinnerService", "Upload",
            "jobService", "transcriptomeService", "paths",
            metaxcanJobController]);

    function metaxcanJobController($scope, $location, $timeout, usSpinnerService, Upload,
                jobService, transcriptomeService, paths){
        var vm = this;
        vm.parameters =  {};
        vm.message = null;
        vm.transcriptomes = null;
        vm.uploadFiles = uploadFiles
        vm.jobService = jobService

        vm.start = start

        initialise();

        function initialise() {
            if (jobService.job == null) {
                $location.path(paths.home);
                return
            }

            if (jobService.job.state == "running") {
                $timeout(function() { usSpinnerService.spin('mp_spinner');}, 100); //workaround to spinner race condition
            }

            vm.transcriptomes = transcriptomeService.transcriptomes;
            parametersUpdated(jobService.metaxcanParameters);
        }

        function start() {
            usSpinnerService.spin('mp_spinner');
            vm.message = "Updating parameters";
            jobService.updateMetaxcanParameters(vm.jobService.job, vm.parameters).then(updateParametersCallback);
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

/* */

        function uploadFiles(files, errFiles) {
            //console.log("upload files")
            //console.log("errorFile:"+JSON.stringify(errFiles))
            angular.forEach(files, function(file) {
                jobService.uploadJobFile(file)
            });
        }
    };

})();