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
            ).success(function(data){
                if (success)
                    success()
                service.token = data.token
            }).error(function(data){
                if (error)
                    error(data)
            })
        }
    };
})();