(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "$location", "$timeout", "$http",
            "usSpinnerService", "Upload",
            "jobService", "configurationService", "paths", "columnSeparatorOptions",
            metaxcanJobController]);

    function metaxcanJobController($scope, $location, $timeout, $http,
                usSpinnerService, Upload,
                jobService, configurationService, paths, columnSeparatorOptions){
        var vm = this;
        vm.parameters =  {};
        vm.message = null;
        vm.transcriptomes = null;
        vm.covariances = null;
        vm.uploadFiles = uploadFiles
        vm.jobService = jobService
        vm.onDownloadResults = onDownloadResults

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

            vm.separatorOptions = columnSeparatorOptions;
            vm.transcriptomes = configurationService.transcriptomes;
            vm.covariances = configurationService.covariances;
            parametersUpdated(jobService.metaxcanParameters);
        }

        function start() {
            usSpinnerService.spin('mp_spinner');
            vm.message = "Updating parameters";

            var found = _.find(vm.separatorOptions, function(el){ return el.key === vm.separatorOption; });
            if (!found) {
                found = separatorOptions[0];
            }
            vm.parameters.separator = found.value;

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

             if (vm.parameters.covariance == null) {
                var c = vm.covariances[0];
                vm.parameters.covariance = c.id;
             }

             if (vm.separatorOption == null) {
                var s = vm.separatorOptions[0];
                vm.separatorOption = s.key;
             }

             if (jobService.job.state == "running") {
                monitorJobState();
             }
        }

        function doStart() {
            jobService.startJob(jobService.job).then(function(result){
                if (! jobService.error ) {
                    monitorJobState();
                } else {
                    vm.message = jobService.error.message;
                }
            });
        }

        function monitorJobState() {
            usSpinnerService.spin('mp_spinner');
            $timeout( function(){
                jobService.getJob(jobService.job.id).then(function(result) {
                    usSpinnerService.stop('mp_spinner');
                    if (result && "message" in result) {
                        vm.message = "Something went wrong, retrying";
                        monitorJobState();
                    } else {
                        vm.message == null;
                        if (jobService.job.state == "running") {
                            monitorJobState();
                        }
                    }
                });
            }, 10000);
        }

/* */

        function uploadFiles(files, errFiles) {
            angular.forEach(files, function(file) {
                jobService.uploadJobFile(file)
            });
        }

/* */
        function onDownloadResults() {
            var url = "metaxcan/api/users/"+jobService.user.id+"/jobs/"+jobService.job.id+"/results/"
            $http({method:'GET',
                    url:url,
                    headers:{Authorization:(' Token '+jobService.token)},
                    responseType: 'blob',
                    })
                .then(function success(response){
                    vm.message = null;
                    var data = response.data;
                    saveAs(data, "results.zip");
                }, function error(response){
                    vm.message = "Something went wrong with the download";
                });
        }
    };

})();