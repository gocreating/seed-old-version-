'use strict';

var app = angular.module('myApp.controllers', []);

app
	
/**************************************************************
 *                                                            *
 * Root Level Controller                                      *
 *                                                            *
 **************************************************************/

	.controller('rootCtrl', ['$scope', '$location', 'alertService', 'authService', 'status', '$translatePartialLoader', function ($scope, $location, alertService, authService, status, $translatePartialLoader) {
		if ($location.search().data) {
			var res = JSON.parse(atob($location.search().data));
			console.log(res);
			$location.path(res.path);
			switch (res.code) {
				// duplicate verification
				case status.ERR_RE_VERIFICATION: {
					alertService.addMessage(0, 'Verification', res.message);
					break;
				}
				// verification token expiration
				case status.TOKEN_EXPIRATION: {
					if (!authService.isAuth) {
						alertService.addMessage(0, 'Verification', 'Token has expired. Just login and you can resend verification mail');
					} else {
						alertService.addMessage(0, 'Verification', 'Token has expired. You can resend verification mail');
						$location.path('/user/reverify');
					}
					break;
				}
				// verification success
				case status.SUCC_VERIFICATION: {
					if (!authService.isAuth) {
						alertService.addMessage(0, 'Verification', res.message);
					} else {
						alertService.addMessage(0, 'Verification', 'Please login again to apply new settings');
						$location.path('/user/logout');
					}
					break;
				}
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
		$translatePartialLoader.addPart('alert');
		$translatePartialLoader.addPart('header');
		$translatePartialLoader.addPart('footer');
	}])

	.controller('alertCtrl', ['$scope', 'alertService', function ($scope, alertService) {
		$scope.messages = alertService.getMessages();
		$scope.deleteMessage = alertService.deleteMessage;
	}])

	.controller('langCtrl', ['$scope', '$translate', function ($scope, $translate) {
		$scope.changeLanguage = function (langKey) {
			$translate.use(langKey);
		};
	}])

/**************************************************************
 *                                                            *
 * User Controller                                            *
 *                                                            *
 **************************************************************/

	.controller('userNewCtrl', ['$scope', 'userFactory', '$location', 'status', 'alertService', function ($scope, userFactory, $location, status, alertService) {
		$scope.error = {
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

		$scope.resetEmail = function (fm) {
			fm.email.$setValidity('exist', true);
			fm.email.$setValidity('sending', true);
		};

		$scope.submit = function(fm) {
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
						case status.ERR_EMAIL_SEND: {
							$scope.error.msg = res.message;
							fm.email.$setValidity('sending', false);
							break;
						}
						case status.USER_EMAIL_EXIST: {
							fm.email.$setValidity('exist', false);
							Recaptcha.reload();
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
						alertService.addMessage(res.code, 'Logout', res.message);
						authService.logout()
						$location.path('/user/login');
					}
				}
			});
	}])
	.controller('userReverifyCtrl', ['$scope', 'userFactory', 'status', 'alertService', function ($scope, userFactory, status, alertService) {
		$scope.error = {
			isWrongCaptcha: false,
			msg: ''
		};

		$scope.form = {
		};

		$scope.submit = function() {
			$scope.form['captcha'] = {
				challenge: $('#recaptcha_challenge_field').val(),
				response: $('#recaptcha_response_field').val()
			};

			userFactory
				.reverify($scope.form)
				.success(function (res) {
					switch (res.code) {
						case status.WRONG_CAPTCHA: {
							$scope.error.isWrongCaptcha = true;
							$scope.error.msg = res.message;
							Recaptcha.reload();
							Recaptcha.focus_response_field();
							break;
						}
						case status.ERR_EMAIL_SEND: {
							Recaptcha.reload();
							Recaptcha.focus_response_field();
							alertService.addMessage(res.code, 'Verification', res.message);
							break;
						}
						case status.OK: {
							$('#recaptcha_challenge_field').val('');
							alertService.addMessage(res.code, 'Verification', res.message);
						}
					}
				});
		};
	}])
	.controller('userRecoveryCtrl', ['$scope', 'userFactory', '$location', 'status', function ($scope, userFactory, $location, status) {
		$scope.form = {
			email:    'gocreating@gmail.com'
		};
		userFactory
			.recovery($scope.form.email)
			.success(function (res) {
				switch (res.code) {
					case status.OK: {
						
					}
				}
			});
	}]);