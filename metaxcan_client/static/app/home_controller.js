(function(){
    'use strict';

    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl', ["$scope", "userService", "jobService", home]);

    function home($scope, userService, jobService) {
        var vm = this;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user;
        vm.activeJob = null;
        vm.error = null;

        initialise();

        function initialise() {
            if (jobService.ready) {
                jobService.getActiveJob().then(activeJobCallback)
            }

            vm.deregister_user_update = $scope.$on(userService.USER_UPDATED_NOTIFICATION, function(event,user) {
                vm.user = user;
            });

            vm.deregister_job_service_ready = $scope.$on(jobService.JOB_SERVICE_READY_NOTIFICATION, function(event) {
                jobService.getActiveJob().then(activeJobCallback);
            });
        }

        function activeJobCallback(result) {
            if (result && "message" in result) {
                activeJobError(result);
            } else {
                activeJobUpdated(result);
            }
        }

        function activeJobUpdated(activeJob) {
            console.log("controller job:"+JSON.stringify(activeJob));
            vm.activeJob = activeJob;
        }

        function activeJobError(error) {
            console.log("controller job:"+JSON.stringify(error));
            vm.error = error.message;
        }

    };

})();