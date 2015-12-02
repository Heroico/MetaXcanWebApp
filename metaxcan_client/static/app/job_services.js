(function(){
    angular.module('metaxcanClientServices')
        .factory('jobService',
        ['$rootScope', '$resource', "$timeout", "$http",
        'userService', 'Upload',
         jobService])

    function jobService($rootScope, $resource, $timeout, $http, userService, Upload){
        var service = {}
        service.updateToken = updateToken;
        service.updateUser = updateUser;
        service.getJobs = getJobs
        service.getJob = getJob
        service.getActiveJob = getActiveJob;
        service.createMetaxcanJob = createMetaxcanJob;
        service.getMetaxcanParameters = getMetaxcanParameters;
        service.updateMetaxcanParameters = updateMetaxcanParameters;
        service.getJobFiles = getJobFiles
        service.uploadJobFile = uploadJobFile
        service.deleteJobFile = deleteJobFile
        service.startJob = startJob
        service.JOB_SERVICE_READY_NOTIFICATION = "jobs:ready";
        service.JOB_SERVICE_DOWN_NOTIFICATION = "jobs:down";

        initialice();

        return service;

/* Setup */
        function initialice() {
            service.ready = false;
            service.job = null;
            service.metaxcanParameters = null;
            service.user =null;
            service.error = null;
            service.files = [];
            service.uploadFiles = []
            service.failedFiles = []

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

        function authorization() {
            var a = ' Token '+service.token
            return a;
        }

/* Metaxcan Jobs */
        function getJobs(offset, limit) {
            var resource = jobResource();
            var p = resource
                        .get({user_id: service.user.id, offset:offset, limit:limit})
                        .$promise
            return p;

        }

        function getJob(jobId) {
            var resource = jobResource();
            var p = resource
                        .get_job({user_id: service.user.id, job_id:jobId})
                        .$promise
            return p;
        }

        // Returns a promise of active job. In case of error, the promise will be fillled an "{errorMessage;'some error message'}" object
        function getActiveJob() {
            var resource = jobResource();
            var p = resource
                        .active({user_id: service.user.id})
                        .$promise
            return p;
        }

        function createMetaxcanJob(parameters) {
            var resource = jobResource();
            var p = resource
                        .create_metaxcan({user_id: service.user.id}, parameters)
                        .$promise
            return p;
        }

        function startJob(job) {
            var resource = jobResource();
            var p = resource
                        .start_job({user_id: service.user.id, job_id:job.id}, {})
                        .$promise
            return p;
        }

        function jobResource() {
            var resource = $resource("api/users/:user_id/jobs/", {}, {
                get_metaxcan_parameters: {
                    url:"api/users/:user_id/jobs/:job_id/metaxcan_parameters/",
                    method:"GET",
                    interceptor:{response: metaxcanParametersSuccessCallback, responseError:metaxcanErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                patch_metaxcan_parameters:{
                    url:"api/users/:user_id/jobs/:job_id/metaxcan_parameters/",
                    method:"PATCH",
                    interceptor:{response: metaxcanParametersSuccessCallback, responseError:metaxcanErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                start_job:{
                    url:"api/users/:user_id/jobs/:job_id/start/",
                    method:"POST",
                    interceptor:{response: jobSuccessCallback, responseError:jobStartErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                create_metaxcan:{
                    url:"api/users/:user_id/jobs/create_metaxcan/",
                    method:"POST",
                    isArray:false,
                    interceptor:{response:jobSuccessCallback, responseError:jobErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                active:{
                    url:"api/users/:user_id/jobs/active/",
                    method:"GET",
                    isArray:false,
                    interceptor:{response:jobSuccessCallback, responseError:jobErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                get_job:{
                    url:"api/users/:user_id/jobs/:job_id/",
                    method:"GET",
                    isArray:false,
                    interceptor:{response:jobSuccessCallback, responseError:jobErrorCallback},
                    headers:{'Authorization': authorization() }
                },
                get:{
                    method:"GET",
                    interceptor:{response:jobListSuccessCallback, responseError:jobListErrorCallback},
                    headers:{'Authorization': authorization() }
                },
            });
            return resource;
        }

        function jobSuccessCallback(response) {
            service.job = null;
            var job = response.data;
            if (job && "id" in job) {
                service.job = job;
            }
            service.error = null;
            return service.job;
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
            service.job = null;
            return service.error;
        }

        function jobStartErrorCallback(response) {
            message = "Something went wrong when starting the Job";
            return handleError(message, response);
        }

        function jobListErrorCallback(response) {
            message = "Something went wrong when requesting job list";
            return handleError(message, response);
        }

        function jobListSuccessCallback(response) {
            results = response.data.results;
            service.error = null;
            return results
        }


/* Metaxcan parameters */

        function getMetaxcanParameters(job) {
            var resource = jobResource();
            var p = resource
                        .get_metaxcan_parameters({user_id: service.user.id, job_id:job.id})
                        .$promise
            return p;
        }

        function updateMetaxcanParameters(job, parameters) {
            var resource = jobResource();
            var p = resource
                        .patch_metaxcan_parameters({user_id: service.user.id, job_id:job.id}, parameters)
                        .$promise
            return p;
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
                    headers:{'Authorization': authorization() }
                }
            });
            return resource;
        }

        function filesSuccessCallback(response) {
            service.error = null
            service.files = response.data;
            return service.files;
        }

        function filesErrorCallback(response) {
            message = "Something went wrong with the job files";
            console.log(JSON.stringify(response));
            return handleError(message, response);
        }

        /* Expects a file as returned by AngularFileUpload. Can accept a progress callback */
        //http://stackoverflow.com/questions/20473572/django-rest-framework-file-upload
        function uploadJobFile(f) {
            console.log("Upload")
            // Seems that angular file upload gets called multiple times.
            if (!checkDupFile(f)) {
                console.log("Dup")
                return null;
            }

            path = buildJobFilesPath();
            f.upload = Upload.upload( {
                url: path,
                data: {name: f.name, file:f},
                headers: {'Authorization': authorization()},
            });

            service.uploadFiles.push(f);

            var p = f.upload.then(function (response) {
                service.files.push(response.data);
                service.uploadFiles = _.reject(service.uploadFiles, function(el){ return el.name === f.name; } );
                return response;
            }, function (response) {
                var message = "Error:"+response.status
                var error = response.data;
                if (error && typeof error === "object" && "detail" in error ) {
                    message = message + ":" + error.detail;
                } else if (error && typeof error === "object" && "file" in error ) {
                    message = message + ":" + error.file;
                } else if (error) {
                    message = message + ":" + JSON.stringify(error)
                }
                f.error = message;
                service.failedFiles.push(f);
                service.uploadFiles = _.reject(service.uploadFiles, function(el){ return el.name === f.name; } );
                return response;
            }, function (evt) {
                f.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                return evt
            });

            return p;
        }

        function deleteJobFile(f) {
            path = buildJobFilesPath();
            path = path +f.id+"/"
            $http({method:'DELETE',
                    url:path,
                    headers:{Authorization: authorization()}
                    })
                .then(function success(response){
                    service.error = null;
                    service.files = _.reject(service.files, function(el){ return el.id == f.id})
                    return response
                }, function error(response){
                    message = "Something went wrong with the download";
                    console.log(JSON.stringify(response.data))
                    handleError(message, response);
                    return response
                });
        }

        function checkDupFile(f) {
            var found = _.find(service.files, function(el){ return el.name === f.name; });
            if (found) return false;

            found = _.find(service.uploadFiles, function(el){ return el.name === f.name; });
            if (found) return false;

            found = _.find(service.failedFiles, function(el){ return el.name === f.name; });
            if (found) return false;

            return true
        }

        function buildJobFilesPath() {
            path = "api/users/"+
                service.user.id +
                "/jobs/"+
                service.job.id+
                "/files/";
            return path;
        }
    }

})();
