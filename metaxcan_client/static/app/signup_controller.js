(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('SignUpCtrl', ["$scope", "$location", "userService", "home_path", signUp]);

    function signUp($scope, $location, userService, home_path){
        var vm = this;
        vm.user = {name:null, password:null, repeat_password:null, email:null };
        vm.signup = signup;
        vm.message = null;

        function signup(){
            vm.message = null;
            //TODO: implement angular directive
            var user = vm.user;
            if (user.password.localeCompare(user.repeat_password)) {
                vm.message = "Passwords dont match"
                return;
            }

            userService.signup(user.name, user.email, user.password, function(){
                vm.message = "OK";
                $location.path(home_path);
            }, function(error){
                vm.message = error;
            })
        }
    };

})();