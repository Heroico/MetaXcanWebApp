(function(){
    angular.module('metaxcanClientServices')
        .factory('userService', ['$http', userService])

    function userService($http){
        var service = {}
        service.token = null
        service.signup = signup
        service.login = login
        service.loggedin = loggedin

        return service;

        function loggedin() {
            return service.token != null;
        }

        function signup(name, email, password, success_handler, error_handler) {
            user_request("/api/users/create/", name, email, password, success_handler, error_handler)
        }

        function login(name, email, password, success_handler, error_handler) {
            user_request("/api/token/", name, email, password, success_handler, error_handler)
        }

        function user_request(url, name, email, password, success_handler, error_handler) {
            var request = {password: password}
            if (name)
                request.username = name
            if (email)
                request.email = email
            var p = $http.post(url, request
            ).then(function(response){
                process_success(response, success_handler)
            }, function(response){
                process_error(response, error_handler)
            })
        }

        function process_success(response, success_handler) {
            service.token = response.data.token
            if (success_handler)
                success_handler();
        }

        function process_error(response, error_handler) {
            var message = null

            if (response != undefined &&
                typeof response == "object" &&
                typeof response.data == "object" ){
                data = response.data
                if ("username" in data) {
                    message = data.username//"User is invalid (or already taken)"
                } else if ("password" in data) {
                    message = data.password
                } else if ("email" in data) {
                    message = data.email
                } else if ("non_field_errors" in data) {
                    message = data.non_field_errors[0]
                } else {
                    message = "Something went wrong. "+response.status
                }
            } else {
                message = "Something went very wrong. "+response.status
            }

            if (error_handler)
                error_handler(message)

        }
    };
})();