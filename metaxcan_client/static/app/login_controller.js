(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('LoginCtrl', ["$scope", login]);

    function login($scope){
        var vm = this;
        vm.user = {name:null, password:null, email:null }
    };

})();