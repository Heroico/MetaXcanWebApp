(function(){
    angular.module('metaxcanClientServices')
        .factory('configurationService',
            ['$rootScope', '$resource',
            'userService',
            configurationService])

    function configurationService(
                $rootScope, $resource,
                userService) {

        var service = {}
        service.getTranscriptomes = getTranscriptomes;
        service.getCovariances = getCovariances;
        service.transcriptomes = null;
        service.covariances = null;
        service.error = null;

        initialice();

        return service;

        function initialice() {


            updateToken(userService.token);
            updateUser(userService.user);

            $rootScope.$on(userService.USER_UPDATED_NOTIFICATION, function(event, user) {
                updateUser(user);
            });

            $rootScope.$on(userService.USER_LOGGED_IN_NOTIFICATION, function(event, token){
                updateToken(token);
            });
        }

        function updateToken(token) {
            if (token) {
                service.token = token;
            } else {
                service.token = "";
            }
        }

        function updateUser(user) {
            if (user) {
                service.user = user;
            } else {
                service.user = null;
            }
        }

        // Returns a promise of transcriptomes. In case of error, the promise will be fillled an "{errorMessage;'some error message'}" object
        function getTranscriptomes() {
            var resource = transcriptomeResource();
            var p = resource
                        .get({user_id: service.user.id})
                        .$promise
            return p;
        }

        function transcriptomeResource() {
            var resource = $resource("metaxcan/api/transcriptomes/", {}, {
                get:{
                    method:"GET",
                    isArray:true,
                    interceptor:{response:transcriptomesSuccessCallback, responseError:transcriptomesErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                },
            });
            return resource;
        }

        function transcriptomesSuccessCallback(response) {
            service.transcriptomes = response.data;
            service.error = null;
            return service.transcriptomes;
        }

        function transcriptomesErrorCallback(response) {
            message = "Something went wrong with the transcriptomes";
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
            service.transcriptomes = null;
            return service.error;
        }

        // Returns a promise of covriances. In case of error, the promise will be fillled an "{errorMessage;'some error message'}" object
        function getCovariances() {
            var resource = covarianceResource();
            var p = resource
                        .get({user_id: service.user.id})
                        .$promise
            return p;
        }

        function covarianceResource() {
            var resource = $resource("metaxcan/api/covariances/", {}, {
                get:{
                    method:"GET",
                    isArray:true,
                    interceptor:{response:covariancesSuccessCallback, responseError:covariancesErrorCallback},
                    headers:{'Authorization':(' Token '+service.token), 'kk':'kk'}
                },
            });
            return resource;
        }

        function covariancesSuccessCallback(response) {
            service.covariances = response.data;
            service.error = null;
            return service.covariances;
        }

        function covariancesErrorCallback(response) {
            message = "Something went wrong with the covariances";
            return handleError(message, response);
        }
    }

})();