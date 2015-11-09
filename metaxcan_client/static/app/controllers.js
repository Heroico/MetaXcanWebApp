(function(){stop
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers', ['metaxcanClientServices', 'angularSpinner'])
        .controller('NavBarCtrl', ["$scope", "userService", navBar]);

    function navBar($scope, userService){
        var vm = this;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user;

        vm.deregister_user_update = $scope.$on(userService.USER_UPDATED_NOTIFICATION, function(event,user) {
            vm.user = user;
        });

        vm.deregister_user_logged_in = $scope.$on(userService.USER_LOGGED_IN_NOTIFICATION, function(event) {
            vm.loggedin = true
        });
    };


})();