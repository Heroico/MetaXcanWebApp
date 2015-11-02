(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('SignUpCtrl', ["$scope", "$location", "userService", signUp]);

    function signUp($scope, $location, userService){
        var vm = this;
        vm.user = {name:null, password:null, repeat_password:null, email:null }
        vm.signup = signup
        vm.message = null

        function signup(){
            userService.signup(vm.user.name, vm.user.email, vm.user.password, function(){
                vm.message = "OK"
                $location.path("home")
            }, function(data){
                vm.message = data
            })
        }
    };

})();