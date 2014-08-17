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
				.success(function (data) {
					if (data.error) {
						switch (data.errCode) {
							case status.ERR_USER_EMAIL_EXIST: {
								$scope.error.isEmailExist = true;
								$scope.error.msg = data.msg;
							}
						}
					} else {
						console.log(data.value);
						$location.path('/user/login');
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
			email:    'gocreating@gmail.com',
			password: '11111111'
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
					.success(function (data) {
						if (data.error) {
							switch (data.errCode) {
								case status.ERR_USER_LOGIN: {
									$scope.error.isLoginFail = true;
									$scope.error.msg = data.msg;
								}
							}
						} else {
							authService.login(data.value);
							$location.path('/');
						}
					});
			}
		};		
	}])
	.controller('userLogoutCtrl', ['$scope', 'userFactory', '$location', 'status', 'authService', function ($scope, userFactory, $location, status, authService) {
		userFactory
			.logout()
			.success(function (data) {
				if (!data.error) {
					authService.logout()
					$location.path('/user/login');
				}
			});
	}]);