(function(){
    var HOME_PATH = 'home';
    var METAXCAN_JOB_PATH = 'metaxcan_job';
    var LOGIN_PATH = 'login';
    var SIGN_UP_PATH = "signup";

    angular
        .module('metaxcan_client', ['metaxcanClientControllers', 'ngRoute', 'ngResource', 'ngDialog'])
        .constant("columnSeparatorOptions", [
            {key:"whitespace", name:"Any Whitespace (including spaces or tabs)", value:"" },
            {key:"comma", name:"Comma", value:","}
        ])
        .constant('paths',
            {home:HOME_PATH,
             metaxcan_job_path:METAXCAN_JOB_PATH,
             login_path:LOGIN_PATH,
             signup_path:SIGN_UP_PATH})
        .config(['$routeProvider',configRouteProvider])
        .config(['$resourceProvider', configResourceProvider]);

    function configResourceProvider($resourceProvider){
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    };

    function configRouteProvider($routeProvider) {
        $routeProvider.
            when("/"+HOME_PATH, {
                templateUrl: 'metaxcan/static/app/partials/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
              }).
            when('/'+LOGIN_PATH, {
                templateUrl: 'metaxcan/static/app/partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
            }).
            when('/'+SIGN_UP_PATH, {
                templateUrl: 'metaxcan/static/app/partials/signup.html',
                controller: 'SignUpCtrl',
                controllerAs: 'vm',
            }).
            when("/"+METAXCAN_JOB_PATH,{
                templateUrl: 'metaxcan/static/app/partials/metaxcan_job.html',
                controller: 'MetaxcanJobCtrl',
                controllerAs: 'vm',
            }).
            otherwise({
                redirectTo: '/home'
            });
    };

})();