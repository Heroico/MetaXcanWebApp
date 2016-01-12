(function(){
    'use strict';

    /**
     * This controller has very little UI. It is meant as an entry point where services should be kicked off.
     */
    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl',
            ["$scope", "$location", "$timeout", "ngDialog",
            "userService", "jobService", "configurationService", "usSpinnerService",
            "paths",
            home]);

    function home($scope, $location, $timeout, ngDialog,
            userService, jobService, configurationService, usSpinnerService, paths) {

        var vm = this;
        vm.onSelectJob = onSelectJob
        vm.onCreateMetaxcan = onCreateMetaxcan;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user;
        vm.job = null;
        vm.error = null;
        vm.jobs = null;
        vm.offset = 0;

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
            configurationService.getTranscriptomes().then(function(result){
                if (configurationService.error) {
                    errorHandler(configurationService.error);
                } else {
                    configurationService.getCovariances().then(function(result){
                        if (configurationService.error) {
                            errorHandler(configurationService.error);
                        } else {
                            jobService.getActiveJob().then(jobCallback);
                        }
                    });
                }
            })
        }

        function errorHandler(error) {
            vm.message = error.message;
            $timeout(function() {
                usSpinnerService.stop('my_spinner');
            }, 100);
        }

        function jobCallback(result) {
            if (result && "message" in result) {
                errorHandler(result);
            } else {
                jobUpdated(result);
            }
        }

        function jobUpdated(activeJob) {
            vm.job = activeJob;
            if (activeJob) {
                $timeout(function() { usSpinnerService.spin('my_spinner');}, 100);
                vm.message = "Found active job, refreshing";
                jobService.getMetaxcanParameters(vm.job).then(metaxcanParametersCallback);
            } else {
                if (vm.jobs != null) {
                    return;
                }
                $timeout(function() { usSpinnerService.stop('my_spinner');}, 100);
                jobService.getJobs(vm.offset, 10).then(function(results){
                    if (results && "message" in results) {
                        errorHandler(results)
                    } else {
                        vm.jobs = results;
                    }
                });
            }
        }

        function metaxcanParametersCallback(result) {
            if (result && !(result instanceof Array) && "message" in result) {
                errorHandler(result);
            } else {
                jobService.getJobFiles(vm.job).then(jobFilesCallback)
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
                template: 'metaxcan/static/app/dialogs/new_metaxcan_dialog.html',
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
            jobService.createMetaxcanJob(value).then(jobCallback)
        }

/* Select old job */
        function onSelectJob(j) {
            jobService.getJob(j.id).then(function(result){
                if (result && "message" in result) {
                    vm.message = "Error getting job";
                } else {
                    jobUpdated(result);
                }
            });
        }
    };

})();