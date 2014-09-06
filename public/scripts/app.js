'use strict';
(function () {

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

app.config(['$stateProvider', '$urlRouterProvider', 'defaultStyle', function ($stateProvider, $urlRouterProvider, defaultStyle) {
	var s = function (view, style, suffix) {
		return view.substr(0, view.length - 5) + '-' + (style || defaultStyle) + '.' + (suffix || 'html');
	};

	$stateProvider
	.state('root', {
		url: '',
		views: {
			'alert': {
				templateUrl: s('views/alert.html', 'bs')
			},
			'header': {
				templateUrl: s('views/header.html', 'bs')
			},
			'container':{
				abstract: true,
				template: '<ui-view />'
			},
			'footer': {
				templateUrl: s('views/footer.html', 'bs')
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
				templateUrl: s('views/general/home.html', 'bs')
			})
			.state('root.general.contact', {
				url: '/contact',
				templateUrl: s('views/general/contact.html')
			})
			.state('root.general.faq', {
				url: '/faq',
				templateUrl: s('views/general/faq.html')
			})

		// policies
		.state('root.policies', {
			url: '/policies',
			templateUrl: s('views/general/policies/index.html')
		})
			.state('root.policies.pricing', {
				url: '/pricing',
				templateUrl: s('views/general/policies/pricing.html')
			})
			.state('root.policies.support', {
				url: '/support',
				templateUrl: s('views/general/policies/support.html')
			})
			.state('root.policies.security', {
				url: '/security',
				templateUrl: s('views/general/policies/security.html')
			})
			.state('root.policies.terms', {
				url: '/terms',
				templateUrl: s('views/general/policies/terms.html')
			})
			.state('root.policies.privacy', {
				url: '/privacy',
				templateUrl: s('views/general/policies/privacy.html')
			})

		// about
		.state('root.about', {
			url: '/about',
			templateUrl: s('views/general/about/index.html')
		})
			.state('root.about.company', {
				url: '/company',
				templateUrl: s('views/general/about/company.html')
			})
			.state('root.about.team', {
				url: '/team',
				templateUrl: s('views/general/about/team.html')
			})
			.state('root.about.service', {
				url: '/service',
				templateUrl: s('views/general/about/service.html')
			})

		// user
		.state('root.user', {
			abstract: true,
			template: '<ui-view />'
		})
			.state('root.user.new', {
				url: '/user/new',
				templateUrl: s('views/user/new.html', 'bs'),
				controller: 'userNewCtrl'
			})
			.state('root.user.login', {
				url: '/user/login',
				templateUrl: s('views/user/login.html', 'bs'),
				controller: 'userLoginCtrl'
			})
			.state('root.user.logout', {
				url: '/user/logout',
				controller: 'userLogoutCtrl'
			})
			.state('root.user.reverify', {
				url: '/user/reverify',
				templateUrl: s('views/user/reverify.html'),
				controller: 'userReverifyCtrl',
				requireAuth: true
			})
			.state('root.user.recovery', {
				url: '/user/recovery',
				templateUrl: s('views/user/recovery.html'),
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
				templateUrl: s('views/special/403.html')
			})
			.state('root.special.404', {
				url: '/404',
				templateUrl: s('views/special/404.html')
			});

	$urlRouterProvider.otherwise('/404');
}]);

}) ();