(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers', [])
        .controller('HomeCtrl', ["$scope", home])
        .controller('LoginCtrl', ["$scope", login])
        .controller('SignUpCtrl', ["$scope", signUp])
        .controller('NavBarCtrl', ["$scope", navBar]);

    function home($scope){
        var vm = this;
    };

    function login($scope){
        var vm = this;
    };

    function signUp($scope){
        var vm = this;
    };

    function navBar($scope){
        var vm = this;
        vm.logged = false;
        vm.user = {name:"kk"}
    };


})();