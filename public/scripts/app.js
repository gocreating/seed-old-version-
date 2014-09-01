'use strict';

var app = angular.module('seed', [
	// 'ngRoute',
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
}]);

// apply authService to the whole scope
app.run(['$rootScope', 'authService', function ($rootScope, authService) {
	$rootScope.authService = authService;
	$rootScope.$watch('authService', function (newValue, oldValue) {
	});
}]);

app.config(function($controllerProvider,$compileProvider,$filterProvider,$provide){
    app.register =
        {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
});

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
			'menu': {
				templateUrl: 'views/menu.html'
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
				views: {
					'container@': {
						templateUrl: 'views/general/contact.html'
					}
				}
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