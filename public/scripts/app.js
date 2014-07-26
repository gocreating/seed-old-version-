'use strict';

angular
	.module('seed', [
		'ngRoute',
		'myApp.filters',
		'myApp.services',
		'myApp.directives',
		'myApp.controllers'
	])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/general/home.html',
			controller: 'homeCtrl'
		});
		$routeProvider.when('/about', {
			templateUrl: 'views/general/about.html',
			controller: 'aboutCtrl'
		});
		$routeProvider.when('/contact', {
			templateUrl: 'views/general/contact.html',
			controller: 'contactCtrl'
		});
		$routeProvider.when('/policies/terms', {
			templateUrl: 'views/general/policies/terms.html',
			controller: 'termsCtrl'
		});
		$routeProvider.when('/policies/privacy', {
			templateUrl: 'views/general/policies/privacy.html',
			controller: 'privacyCtrl'
		});
	}])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/about', {
			templateUrl: 'views/general/about.html',
			controller: 'aboutCtrl'
		});
	}])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/'});
	}]);
