(function(){
    'use strict';

    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl',
            ["$scope", "$location", "$timeout", "userService", "jobService", "usSpinnerService",
            "paths",
            home]);

    function home($scope, $location, $timeout, userService, jobService, usSpinnerService, paths) {
        var vm = this;
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
                $location.path(paths.metaxcan_job_path);
            }
        }

        function activeJobError(error) {
            vm.error = error.message;
        }

    };

})();