'use strict';

var app = angular.module('seed', [
	'pascalprecht.translate',
	'ui.router',
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
	$locationProvider.hashPrefix('!');
}]);

// apply authService to the whole scope
app.run(['$rootScope', 'authService', function ($rootScope, authService) {
	$rootScope.authService = authService;
	$rootScope.$watch('authService', function (newValue, oldValue) {
	});
}]);

// i18n configuration
app.config(['$translateProvider', '$translatePartialLoaderProvider', function ($translateProvider, $translatePartialLoaderProvider) {
	$translateProvider
		.useLoader('$translatePartialLoader', {
			urlTemplate: '/i18n/{part}-{lang}.json'
		})
		.preferredLanguage('en')
		.fallbackLanguage('en');
}]);

function loadTranslate (loader, name) {
	var nameArr = name.split('.');
	nameArr.shift();

	while (nameArr.length) {
		var part = nameArr.join('/');
		loader.addPart(part);
		nameArr.pop();
	}
}

app.run(['$rootScope', '$translatePartialLoader', '$translate', function ($rootScope, $translatePartialLoader, $translate) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		// var viewPath = String(toState.templateUrl);
		// console.log(viewPath);
		// var part = viewPath.substr(6, viewPath.length - 11);
		// $translatePartialLoader.addPart(part);
		loadTranslate($translatePartialLoader, toState.name);
	});

	$rootScope.$on('$translatePartialLoaderStructureChanged', function () {
		$translate.refresh();
	});
}]);

/**************************************************************
 *                                                            *
 * Nested Routing                                             *
 *                                                            *
 **************************************************************/

app.run(['$rootScope', 'authService', function ($rootScope, authService) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		if (toState.requireAuth && !authService.isAuth) {
			toState.templateUrl = 'views/special/403.html';
		}
	});
}]);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('root', {
		url: '',
		views: {
			'alert': {
				templateUrl: 'views/alert.html'
			},
			'header': {
				templateUrl: 'views/header.html'
			},
			'container':{
				abstract: true,
				template: '<ui-view />'
			},
			'footer': {
				templateUrl: 'views/footer.html'
			}
		}
	})
		// general
		.state('root.general', {
			abstract: true,
			template: '<ui-view />'
		})
			.state('root.general.home', {
				url: '/',
				templateUrl: 'views/general/home.html'
			})
			.state('root.general.contact', {
				url: '/contact',
				templateUrl: 'views/general/contact.html'
			})
			.state('root.general.faq', {
				url: '/faq',
				templateUrl: 'views/general/faq.html'
			})

		// policies
		.state('root.policies', {
			url: '/policies',
			templateUrl: 'views/general/policies/index.html'
		})
			.state('root.policies.pricing', {
				url: '/pricing',
				templateUrl: 'views/general/policies/pricing.html'
			})
			.state('root.policies.support', {
				url: '/support',
				templateUrl: 'views/general/policies/support.html'
			})
			.state('root.policies.security', {
				url: '/security',
				templateUrl: 'views/general/policies/security.html'
			})
			.state('root.policies.terms', {
				url: '/terms',
				templateUrl: 'views/general/policies/terms.html'
			})
			.state('root.policies.privacy', {
				url: '/privacy',
				templateUrl: 'views/general/policies/privacy.html'
			})

		// about
		.state('root.about', {
			url: '/about',
			templateUrl: 'views/general/about/index.html'
		})
			.state('root.about.company', {
				url: '/company',
				templateUrl: 'views/general/about/company.html'
			})
			.state('root.about.team', {
				url: '/team',
				templateUrl: 'views/general/about/team.html'
			})
			.state('root.about.service', {
				url: '/service',
				templateUrl: 'views/general/about/service.html'
			})

		// user
		.state('root.user', {
			abstract: true,
			template: '<ui-view />'
		})
			.state('root.user.new', {
				url: '/user/new',
				templateUrl: 'views/user/new.html',
				controller: 'userNewCtrl'
			})
			.state('root.user.login', {
				url: '/user/login',
				templateUrl: 'views/user/login.html',
				controller: 'userLoginCtrl'
			})
			.state('root.user.logout', {
				url: '/user/logout',
				controller: 'userLogoutCtrl'
			})
			.state('root.user.reverify', {
				url: '/user/reverify',
				templateUrl: 'views/user/reverify.html',
				controller: 'userReverifyCtrl'
			})
			.state('root.user.recovery', {
				url: '/user/recovery',
				templateUrl: 'views/user/recovery.html',
				controller: 'userRecoveryCtrl'
			})

		// special
		.state('root.special', {
			abstract: true,
			views: {
				'container@': {
					template: '<ui-view />'
				},
				'footer@': {
					template: ''
				}
			}
		})
			.state('root.special.403', {
				url: '/403',
				templateUrl: 'views/special/403.html'
			})
			.state('root.special.404', {
				url: '/404',
				templateUrl: 'views/special/404.html'
			});

	$urlRouterProvider.otherwise('/404');
}]);