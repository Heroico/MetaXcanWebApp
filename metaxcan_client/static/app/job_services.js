(function(){
    angular.module('metaxcanClientServices')
        .factory('jobService', ['$rootScope', '$resource', 'userService', 'fileService',
         jobService])

    function jobService($rootScope, $resource, userService, fileService){
        var service = {}
        service.updateToken = updateToken;
        service.updateUser = updateUser;
        service.getActiveJob = getActiveJob;
        service.createMetaxcanJob = createMetaxcanJob;
        service.getMetaxcanParameters = getMetaxcanParameters;
        service.updateMetaxcanParameters = updateMetaxcanParameters;
        service.getJobFiles = getJobFiles
        service.JOB_SERVICE_READY_NOTIFICATION = "jobs:ready";
        service.JOB_SERVICE_DOWN_NOTIFICATION = "jobs:down";
        service.ready = false;
        service.activeJob = null;
        service.metaxcanParameters = null;
        service.user =null;
        service.error = null;
        service.files = [];

        initialice();

        return service;

/* Setup */
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


/* Metaxcan Jobs */

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

        function createMetaxcanJob(parameters) {
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
            job = response.data;
            if (job && "id" in job) {
                service.activeJob = job;
            }
            service.error = null;
            return service.activeJob;
        }

        function jobErrorCallback(response) {
            message = "Something went wrong with the Job";
            return handleError(message, response);
        }

        function handleError(message, response) {
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

/* Metaxcan parameters */

        function getMetaxcanParameters(job) {
            var resource = jobResource();
            var p = resource
                        .get_metaxcan_parameters({user_id: service.user.id, job_id:job.id})
                        .$promise
            return p;
        }

        function updateMetaxcanParameters(parameters) {
            var resource = jobResource();
            var p = resource
                        .patch_metaxcan_parameters({user_id: service.user.id, job_id:job.id}, parameters)
                        .$promise
            return p;
        }

        function jobResource() {
            var resource = $resource("api/users/:user_id/jobs/:job_id/metaxcan_parameters/", {}, {
                get_metaxcan_parameters: {
                    method:"GET",
                    interceptor:{response: metaxcanParametersSuccessCallback, responseError:metaxcanErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                },
                patch_metaxcan_parameters:{
                    method:"PATCH",
                    interceptor:{response: metaxcanParametersSuccessCallback, responseError:metaxcanErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                }
            });
            return resource;
        }

        function metaxcanParametersSuccessCallback(response) {
            parameters = response.data;
            if (parameters && "snp_column" in parameters) {
                service.metaxcanParameters = parameters;
                //TODO: workaround until API gets defined
                if (service.metaxcanParameters.transcriptome == null) {
                    delete service.metaxcanParameters.transcriptome
                }
            }
            service.error = null;
            return service.metaxcanParameters;
        }

        function metaxcanErrorCallback(response) {
            message = "Something went wrong with the metaxcan parameters";
            return handleError(message, response);
        }

/* Files */
        function getJobFiles(job) {
            var resource = filesResource();
            var p = resource.get_files({user_id:service.user.id, job_id:job.id}).$promise;
            return p;
        }

        function filesResource() {
                var resource = $resource("api/users/:user_id/jobs/:job_id/files/", {}, {
                get_files: {
                    method:"GET",
                    isArray:true,
                    interceptor:{response: filesSuccessCallback, responseError:filesErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                }
            });
            return resource;
        }

        function filesSuccessCallback(response) {
            console.log(JSON.stringify(response))
            service.error = null
            service.files = response.data;
            return service.files;
        }

        function filesErrorCallback(response) {
            message = "Something went wrong with the job files";
            console.log(JSON.stringify(response));
            return handleError(message, response);
        }
    }

})();