'use strict';

var app = angular.module('myApp.controllers', []);

app
	
/**************************************************************
 *                                                            *
 * Root Level Controller                                      *
 *                                                            *
 **************************************************************/

	.controller('rootCtrl', ['$scope', 'authService', function ($scope, authService) {
	}])

/**************************************************************
 *                                                            *
 * User Controller                                            *
 *                                                            *
 **************************************************************/

	.controller('userNewCtrl', ['$scope', 'userFactory', '$location', 'status', function ($scope, userFactory, $location, status) {
		$scope.error = {
			isEmailExist: false,
			msg: ''
		};

		$scope.form = {
			email:    'test@test.test',
			password: 'testtest',
			confirm:  'testtest',
			name:     'test',
			sex:      1,
			birthday: '',
			phone:    '',
			address:  ''
		};

		$scope.submit = function() {
			userFactory
				.create($scope.form)
				.success(function (res) {
					switch (res.code) {
						case status.USER_EMAIL_EXIST: {
							$scope.error.isEmailExist = true;
							$scope.error.msg = res.message;
							break;
						}
						case status.OK: {
							$location.path('/user/login');
						}
					}
				});
		};		
	}])
	.controller('userLoginCtrl', ['$scope', 'userFactory', '$location', 'status', 'authService', function ($scope, userFactory, $location, status, authService) {
		$scope.error = {
			isLoginFail: false,
			email: {
				isInvalid: false
			},
			password: {
				isInvalid: false
			},
			msg: ''
		};

		$scope.form = {
			email:    'test@test.testt',
			password: 'testtest'
		};

		$scope.resetVlidation = function (key) {
			$scope.error[key].isInvalid = false;
		};

		$scope.submit = function(fm) {
			$scope.error.email.isInvalid = fm.email.$invalid;
			$scope.error.password.isInvalid = fm.password.$invalid;
			if (fm.$valid) {
				userFactory
					.login($scope.form)
					.success(function (res) {
						switch (res.code) {
							case status.USER_WRONG_ACCOUNT: {
								$scope.error.isLoginFail = true;
								$scope.error.msg = res.message;
								break;
							}
							case status.OK: {
								console.log('login');
								console.log(res);
								authService.login(res.data.user);
								authService.setToken(res.data.token);
								$location.path('/');
							}
						}
					});
			}
		};		
	}])
	.controller('userLogoutCtrl', ['$scope', 'userFactory', '$location', 'status', 'authService', function ($scope, userFactory, $location, status, authService) {
		userFactory
			.logout()
			.success(function (res) {
				switch (res.code) {
					case status.OK: {
						console.log('logout');
						console.log(res);
						authService.logout()
						$location.path('/user/login');
					}
				}
			});
	}]);