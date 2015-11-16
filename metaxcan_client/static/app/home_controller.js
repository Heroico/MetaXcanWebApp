(function(){
    'use strict';

    /**
     * This controller has very little UI. It is meant as an entry point where services should be kicked off.
     */
    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl',
            ["$scope", "$location", "$timeout", "ngDialog",
            "userService", "jobService", "transcriptomeService", "usSpinnerService",
            "paths",
            home]);

    function home($scope, $location, $timeout, ngDialog,
            userService, jobService, transcriptomeService, usSpinnerService, paths) {

        var vm = this;
        vm.onCreateMetaxcan = onCreateMetaxcan;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user;
        vm.job = null;
        vm.error = null;

        initialise();

        function initialise() {
            if (jobService.ready) {
                refresh();
            }

            vm.deregister_user_update = $scope.$on(userService.USER_UPDATED_NOTIFICATION, function(event,user) {
                vm.user = user;
            });

            vm.deregister_job_service_ready = $scope.$on(jobService.JOB_SERVICE_READY_NOTIFICATION, function(event) {
                refresh();
            });
        }

        function refresh() {
            $timeout(function() {
                usSpinnerService.spin('my_spinner');
            }, 100);
            transcriptomeService.getTranscriptomes().then(function(result){
                if (transcriptomeService.error) {
                    errorHandler(transcriptomeService.error)
                } else {
                    jobService.getActiveJob().then(activeJobCallback)
                }
            })
        }

        function errorHandler(error) {
            vm.message = error.message;
            $timeout(function() {
                usSpinnerService.stop('my_spinner');
            }, 100);
        }

        function activeJobCallback(result) {
            if (result && "message" in result) {
                errorHandler(result);
            } else {
                activeJobUpdated(result);
            }
        }

        function activeJobUpdated(activeJob) {
            vm.job = activeJob;
            if (activeJob) {
                $timeout(function() { usSpinnerService.spin('my_spinner');}, 100);
                vm.message = "Found active job, refreshing";
                jobService.getMetaxcanParameters(jobService.job).then(metaxcanParametersCallback);
            } else {
                $timeout(function() { usSpinnerService.stop('my_spinner');}, 100);
            }
        }

        function metaxcanParametersCallback(result) {
            if (result && "message" in result) {
                errorHandler(result);
            } else {
                jobService.getJobFiles(jobService.job).then(jobFilesCallback)
            }
        }

        function jobFilesCallback(result) {
            if (result && typeof result === "object" && "message" in result) {
                errorHandler(result);
            } else {
                refreshComplete();
            }
        }

        function refreshComplete() {
            $timeout(function() { usSpinnerService.stop('my_spinner');}, 100);
            vm.message = "Refreshed parameters, redirecting";
            $location.path(paths.metaxcan_job_path);
        }

/* Create Metaxcan job event */
        function onCreateMetaxcan() {
            var dialog = ngDialog.open({
                template: 'static/app/dialogs/new_metaxcan_dialog.html',
                controller: ['$scope', function($scope) {
                    //sigh, old style, "controllerAs" is not working
                    $scope.parameters = {
                        title: null
                    };

                    $scope.done = done;

                    function done() {
                        $scope.closeThisDialog($scope.parameters);
                    }
                }]
            });

            dialog.closePromise.then(doCreateMetaxcan);
        }

        function doCreateMetaxcan(result) {

            console.log("result "+JSON.stringify(result))
            if (!result || !result.value) {
                return;
            }

            var value = result.value
            if (typeof value === "string" ) {
                return;
            }

            usSpinnerService.spin('my_spinner');
            jobService.createMetaxcanJob(value).then(activeJobCallback)
        }

    };

})();