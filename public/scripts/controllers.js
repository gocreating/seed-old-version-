'use strict';

var app = angular.module('myApp.controllers', []);

app
	
/**************************************************************
 *                                                            *
 * Root Level Controller                                      *
 *                                                            *
 **************************************************************/

	.controller('rootCtrl', ['$scope', '$location', 'alertService', 'authService', 'status', function ($scope, $location, alertService, authService, status) {
		if ($location.search().data) {
			var res = JSON.parse(atob($location.search().data));
			console.log(res);
			$location.path(res.path);
			switch (res.code) {
				case status.ERR_SOCIAL_LOGIN: {
					alertService.addMessage(0, 'social login', res.message);
					break;
				}
				case status.SUCC_SOCIAL_LOGIN: {
					alertService.addMessage(0, 'social login', res.message);
					authService.login(res.data.user);
					authService.setToken(res.data.token);
				}
			}
			// clear search
			$location.url($location.path());
		}
	}])

	.controller('alertCtrl', ['$scope', 'alertService', function ($scope, alertService) {
		$scope.messages = alertService.getMessages();
		$scope.deleteMessage = alertService.deleteMessage;
	}])

/**************************************************************
 *                                                            *
 * User Controller                                            *
 *                                                            *
 **************************************************************/

	.controller('userNewCtrl', ['$scope', 'userFactory', '$location', 'status', 'alertService', function ($scope, userFactory, $location, status, alertService) {
		$scope.error = {
			isEmailExist: false,
			isWrongCaptcha: false,
			msg: ''
		};

		$scope.form = {
			email:    'gocreating@gmail.com',
			password: 'testtest',
			confirm:  'testtest',
			name:     'test',
			sex:      1,
			birthday: '',
			phone:    '',
			address:  ''
		};

		$scope.isAgree = true;

		$scope.submit = function() {
			$scope.form['captcha'] = {
				challenge: $('#recaptcha_challenge_field').val(),
				response: $('#recaptcha_response_field').val()
			};

			userFactory
				.create($scope.form)
				.success(function (res) {
					console.log(res);
					switch (res.code) {
						case status.WRONG_CAPTCHA: {
							$scope.error.isWrongCaptcha = true;
							$scope.error.msg = res.message;
							Recaptcha.reload();
							Recaptcha.focus_response_field();
							break;
						}
						case status.USER_EMAIL_EXIST: {
							$scope.error.isEmailExist = true;
							$scope.error.msg = res.message;
							break;
						}
						case status.OK: {
							alertService.addMessage(res.code, 'Registration', res.message);
							$location.path('/user/login');
						}
					}
				});
		};		
	}])
	.controller('userLoginCtrl', ['$scope', '$rootScope', 'userFactory', '$location', 'status', 'authService', 'alertService', function ($scope, $rootScope, userFactory, $location, status, authService, alertService) {
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
							case status.USER_WRONG_ACCOUNT:
							case status.USER_NOT_VERIFIED: {
								$scope.error.isLoginFail = true;
								$scope.error.msg = res.message;
								$scope.form.password = '';
								break;
							}
							case status.OK: {
								console.log('login');
								console.log(res);
								alertService.addMessage(res.code, 'Login', res.message);
								authService.login(res.data.user);
								authService.setToken(res.data.token);
								$location.path('/');
							}
						}
					});
			}
		};		
	}])
	.controller('userLogoutCtrl', ['$scope', 'userFactory', '$location', 'status', 'authService', 'alertService', function ($scope, userFactory, $location, status, authService, alertService) {
		userFactory
			.logout()
			.success(function (res) {
				switch (res.code) {
					case status.OK: {
						console.log('logout');
						console.log(res);
						alertService.addMessage(res.code, 'Logout', res.message);
						authService.logout()
						$location.path('/user/login');
					}
				}
			});
	}]);