(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers', ['metaxcanClientServices'])
        .controller('HomeCtrl', ["$scope", home])
        .controller('NavBarCtrl', ["$scope", navBar]);

    function home($scope){
        var vm = this;
    };

    function navBar($scope){
        var vm = this;
        vm.logged = false;
        vm.user = {name:"kk"}
    };


})();