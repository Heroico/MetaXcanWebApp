(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('LoginCtrl', ["$scope", "$location", "userService", login]);

    function login($scope, $location, userService){
        var vm = this;
        vm.user = {name_or_email:null, password:null}
        vm.message = null;
        vm.login = login

        function login(){
            vm.message = null;

            var name = null
            var email = null
/*          TODO: enable login with email
            var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (re.test(vm.user.name_or_email)) {
                email = vm.user.name_or_email
            } else {
                name = vm.user.name_or_email
            }
*/
            name = vm.user.name_or_email

            userService.login(name, email, vm.user.password, function(){
                vm.message = "OK";
                $location.path("home");
            }, function(error){
                vm.message = error;
            })
        }
    };

})();