(function(){
    var HOME_PATH = 'home';
    var METAXCAN_JOB_PATH = 'metaxcan_job';

    angular
        .module('metaxcan_client', ['metaxcanClientControllers', 'ngRoute', 'ngResource'])
        .constant('home_path', HOME_PATH)
        .constant('metaxcan_job_path', METAXCAN_JOB_PATH)
        .config(['$routeProvider',configRouteProvider])
        .config(['$resourceProvider', configResourceProvider]);

    function configResourceProvider($resourceProvider){
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    function configRouteProvider($routeProvider) {
        $routeProvider.
            when("/"+HOME_PATH, {
                templateUrl: 'static/app/partials/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
              }).
            when('/login', {
                templateUrl: 'static/app/partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
            }).
            when('/signup', {
                templateUrl: 'static/app/partials/signup.html',
                controller: 'SignUpCtrl',
                controllerAs: 'vm',
            }).
            when("/"+METAXCAN_JOB_PATH,{
                templateUrl: 'static/app/partials/metaxcan_job.html',
                controller: 'MetaxcanJobCtrl',
                controllerAs: 'vm',
            }).
            otherwise({
                redirectTo: '/home'
            });
  }

})();