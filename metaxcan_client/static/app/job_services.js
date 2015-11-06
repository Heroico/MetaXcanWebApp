(function(){
    angular.module('metaxcanClientServices')
        .factory('jobService', ['$rootScope', '$resource', 'userService', jobService])

    function jobService($rootScope, $resource, userService){
        var service = {}
        service.updateToken = updateToken;
        service.updateUser = updateUser;
        service.getActiveJob = getActiveJob;
        service.createJob = createJob
        service.JOB_SERVICE_READY_NOTIFICATION = "jobs:ready";
        service.JOB_SERVICE_DOWN_NOTIFICATION = "jobs:down";
        service.ready = false;
        service.activeJob = null;
        service.user =null;
        service.error = null;

        initialice();

        return service;

        function initialice() {
            service.updateToken(userService.token);
            service.updateUser(userService.user);

            $rootScope.$on(userService.USER_UPDATED_NOTIFICATION, function(event, user) {
                service.updateUser(user);
            });

            $rootScope.$on(userService.USER_LOGGED_IN_NOTIFICATION, function(event, token){
                service.updateToken(token);
            });
        }

        function updateToken(token) {
            if (token) {
                service.token = token;
            } else {
                service.token = "";
            }
            updateReadyStatus();
        }

        function updateUser(user) {
            if (user) {
                service.user = user;
            } else {
                service.user = null;
            }
            updateReadyStatus();
        }

        function updateReadyStatus() {
            if (service.user &&
                service.user.id &&
                service.token &&
                service.token.length > 0) {
                service.ready = true;
                $rootScope.$broadcast(service.JOB_SERVICE_READY_NOTIFICATION);
            } else {
                service.ready = false;
                $rootScope.$broadcast(service.JOB_SERVICE_DOWN_NOTIFICATION);
            }
        }

        // Returns a promise of active job. In case of error, the promise will be fillled an "{errorMessage;'some error message'}" object
        function getActiveJob() {
            var resource = $resource("api/users/:user_id/jobs/active/", {}, {
                active:{
                    method:"GET",
                    isArray:false,
                    interceptor:{response:jobSuccessCallback, responseError:jobErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                },
            });

            var p = resource
                        .active({user_id: service.user.id})
                        .$promise
            return p;
        }

        function createJob(parameters) {
            var resource = $resource("api/users/:user_id/jobs/create_metaxcan/", {}, {
                create_metaxcan:{
                    method:"POST",
                    isArray:false,
                    interceptor:{response:jobSuccessCallback, responseError:jobErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                },
            });

            var p = resource
                        .create_metaxcan({user_id: service.user.id}, parameters)
                        .$promise
            return p;
        }

        function jobSuccessCallback(response) {
            //console.log("Active job success "+JSON.stringify(response))
            job = response.data;
            if (job && "id" in job) {
                service.activeJob = job;
            }
            service.error = null;
            return service.activeJob;
        }

        function jobErrorCallback(response) {
            //console.log("Active job error "+JSON.stringify(response))
            message = "Something went wrong with the Job";
            if (response != undefined &&
                typeof response == "object" &&
                typeof response.data == "object" ) {
                data = response.data;
                if ("detail" in data) {
                    message = data.detail;
                }
            }
            service.error = {message:message};
            service.activeJob = null;
            return service.error;
        }
    }

})();