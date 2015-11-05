(function(){
    angular
        .module('metaxcan_client', ['metaxcanClientControllers', 'ngRoute', 'ngResource'])
        .config(['$routeProvider',configRouteProvider])
        .config(['$resourceProvider', configResourceProvider]);

    function configResourceProvider($resourceProvider){
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    function configRouteProvider($routeProvider) {
        $routeProvider.
            when('/home', {
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
            otherwise({
                redirectTo: '/home'
            });
  }

})();