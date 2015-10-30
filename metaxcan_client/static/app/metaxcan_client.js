(function(){
    angular
        .module('metaxcan_client', ['metaxcanClientControllers', 'ngRoute'])
        .config(['$routeProvider',configRouteProvider]);

    function configRouteProvider($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'static/app/partials/home.html',
                controller: 'HomeCtrl'
              }).
            when('/login', {
                templateUrl: 'static/app/partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
            }).
            when('/register', {
                templateUrl: 'static/app/partials/register.html',
                controller: 'RegisterCtrl',
                controllerAs: 'vm',
            }).
            otherwise({
                redirectTo: '/home'
            });
  }

})();