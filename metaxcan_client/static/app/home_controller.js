(function(){
    'use strict';

    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl',
            ["$scope", "$location", "$timeout", "ngDialog",
            "userService", "jobService", "usSpinnerService",
            "paths",
            home]);

    function home($scope, $location, $timeout, ngDialog, userService, jobService, usSpinnerService, paths) {
        var vm = this;
        vm.onCreateMetaxcan = onCreateMetaxcan;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user;
        vm.activeJob = null;
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
            //workaround for stupid spinner bug
            $timeout(function() {
                usSpinnerService.spin('my_spinner');
            }, 100);
            jobService.getActiveJob().then(activeJobCallback)
        }

        function activeJobCallback(result) {
            $timeout(function() {
                usSpinnerService.stop('my_spinner');
            }, 100);

            if (result && "message" in result) {
                activeJobError(result);
            } else {
                activeJobUpdated(result);
            }
        }

        function activeJobUpdated(activeJob) {
            vm.activeJob = activeJob;
            if (activeJob) {
                vm.message = "Found active job, redirecting";
                $location.path(paths.metaxcan_job_path);
            }
        }

        function activeJobError(error) {
            vm.message = error.message;
        }

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

            if ( value ){
                alert(value);
            }
        }

    };

})();