'use strict';

var app = angular.module('seed', [
	'ngRoute',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers'
]);

app.config(['$httpProvider', function ($httpProvider) {
	// delete $httpProvider.defaults.headers.common['X-Requested-With'];
	// $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
	// $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
	// $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
	// $httpProvider.defaults.headers.common['Access-Control-Max-Age'] = '1728000';
	// $httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
	// $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
	// $httpProvider.defaults.useXDomain = true;
	
	// $httpProvider.defaults.headers.common['responseType'] = 'json';
}]);

// general
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/',                 {templateUrl: 'views/general/home.html'});
	$routeProvider.when('/about',            {templateUrl: 'views/general/about.html'});
	$routeProvider.when('/contact',          {templateUrl: 'views/general/contact.html'});
	$routeProvider.when('/policies/terms',   {templateUrl: 'views/general/policies/terms.html'});
	$routeProvider.when('/policies/privacy', {templateUrl: 'views/general/policies/privacy.html'});
}]);

// user
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/user/new', {controller: 'userNewCtrl', templateUrl: 'views/user/new.html'});
}]);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.otherwise({
		templateUrl: 'views/special/404.html'
	});
}]);

app.config(['$locationProvider', function ($locationProvider) {
	$locationProvider.html5Mode(true);
}]);