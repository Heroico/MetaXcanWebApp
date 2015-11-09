(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "jobService", metaxcanJobController]);

    function metaxcanJobController($scope, jobService){
        var vm = this;
        vm.job = jobService.activeJob;
        vm.parameters =  jobService.metaxcanParameters;

        vm.start = start

        function start() {
            alert(vm.parameters.beta_sign_column);
        }

    };

})();