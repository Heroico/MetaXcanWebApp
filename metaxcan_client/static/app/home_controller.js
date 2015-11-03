(function(){
    'use strict';

    angular.module('metaxcanClientControllers')
        .controller('HomeCtrl', ["$scope", "userService", home]);

    function home($scope, userService){
        var vm = this;
        vm.logged = userService.loggedin();
    };

})();