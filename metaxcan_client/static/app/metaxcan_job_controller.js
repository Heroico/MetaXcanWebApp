(function(){
    'use strict';

    /* Controllers */
    angular.module('metaxcanClientControllers')
        .controller('MetaxcanJobCtrl', ["$scope", "jobService", metaxcanJobController]);

    function metaxcanJobController($scope, jobService){
        var vm = this;
        vm.job = jobService.activeJob;
        vm.parameters =  {};
        vm.parameters.snp_column = "SNP";

        vm.start = start

        function start() {
            alert(vm.parameters.beta_sign_column);
        }

    };

})();