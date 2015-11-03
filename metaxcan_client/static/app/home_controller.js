(function(){
    'use strict';

    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl', ["$scope", "userService", home]);

    function home($scope, userService){
        var vm = this;
        vm.loggedin = userService.loggedin();
        vm.user = userService.user

        vm.deregister_user_update = $scope.$on(userService.USER_UPDATED_NOTIFICATION, function(event,user) {
            vm.user = user;
        });
    };

})();