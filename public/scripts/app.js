'use strict';

var app = angular.module('seed', [
	'ngRoute',
	'ngCookies',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers'
]);

/**************************************************************
 *                                                            *
 * Configuration                                              *
 *                                                            *
 **************************************************************/

// handling communicaiton information and behavior
app.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push('httpErrorHandle');
	$httpProvider.interceptors.push('tokenInjector');
}]);

// remove the default hashtag(#) on URL
app.config(['$locationProvider', function ($locationProvider) {
	$locationProvider.html5Mode(true);
}]);

// apply authService to the whole scope
app.run(['$rootScope', 'authService', function ($rootScope, authService) {
	$rootScope.authService = authService;
	$rootScope.$watch('authService', function (newValue, oldValue) {
	});
}]);

/**************************************************************
 *                                                            *
 * Routing                                                    *
 *                                                            *
 **************************************************************/

// general
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/',                  {templateUrl: 'views/general/home.html'});
	$routeProvider.when('/contact',           {templateUrl: 'views/general/contact.html'});

	// policies
	$routeProvider.when('/policies/pricing',  {templateUrl: 'views/general/policies/pricing.html'});
	$routeProvider.when('/policies/support',  {templateUrl: 'views/general/policies/support.html'});
	$routeProvider.when('/policies/security', {templateUrl: 'views/general/policies/security.html'});
	$routeProvider.when('/policies/terms',    {templateUrl: 'views/general/policies/terms.html'});
	$routeProvider.when('/policies/privacy',  {templateUrl: 'views/general/policies/privacy.html'});
	$routeProvider.when('/faq',               {templateUrl: 'views/general/faq.html'});

	// about
	$routeProvider.when('/about/company',     {templateUrl: 'views/general/about/company.html'});
	$routeProvider.when('/about/team',        {templateUrl: 'views/general/about/team.html'});
	$routeProvider.when('/about/service',     {templateUrl: 'views/general/about/service.html'});
}]);

// user
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/user/new',    {controller: 'userNewCtrl',    templateUrl: 'views/user/new.html'});
	$routeProvider.when('/user/login',  {controller: 'userLoginCtrl',  templateUrl: 'views/user/login.html'});
	$routeProvider.when('/user/logout', {controller: 'userLogoutCtrl', template: ' '});
}]);

// 404
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.otherwise({templateUrl: 'views/special/404.html'});
}]);