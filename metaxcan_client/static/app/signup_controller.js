(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('SignUpCtrl', ["$scope", signUp]);

    function signUp($scope){
        var vm = this;
        vm.user = {name:null, password:null, repeat_password:null, email:null }
    };

})();