(function(){
    angular.module('metaxcanClientServices')
        .factory('userService', ['$http', userService])

    function userService($http){
        var service = {}
        service.token = null
        service.signup = signup

        return service;

        function loggedin() {
            return service.token != null;
        }

        function signup(name, email, password, success, error) {
            var p = $http.post("/api/users/create/",
                {
                    username: name,
                    email: email,
                    password: password
                }
            ).then(function(response){
                service.token = response.data.token
                if (success)
                    success()
            }, function(response){
                var message = null

                if (response != undefined &&
                    typeof response == "object" &&
                    typeof response.data == "object" ){
                    data = response.data
                    if ("username" in data) {
                        message = "User is invalid (or already taken)"
                    } else if ("password" in data) {
                        message = data.password
                    } else if ("email" in data) {
                        message = data.email
                    } else {
                        message = "Something went wrong. "+response.status
                    }
                } else {
                    message = "Something went very wrong. "+response.status
                }

                if (error)
                    error(message)
            })
        }
    };
})();