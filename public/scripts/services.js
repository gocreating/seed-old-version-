'use strict';

(function () {
	var app = angular.module('myApp.services', []);

	var status = {
		OK:                    200,
		INTERNAL_SERVER_ERROR: 500,
		ERR_VALIDATION:        0x10000002,
		USER_EMAIL_EXIST:      0x10000003,
		USER_WRONG_ACCOUNT:    0x10000004,
		TOKEN_WRONG_FORMAT:    0x10000005,
		TOKEN_EXPIRATION:      0x10000006,
		SUCC_SOCIAL_LOGIN:     0x00000007,
		ERR_SOCIAL_LOGIN:      0x10000008,
		WRONG_CAPTCHA:         0x10000009,
		USER_NOT_VERIFIED:     0x1000000A,
		ERR_EMAIL_SEND:        0x1000000B
	};

	app.constant('status', status);

	// ref: http://stackoverflow.com/questions/11956827/angularjs-intercept-all-http-json-responses
	app
		.factory('httpErrorHandle', ['$q', 'alertService', function ($q, alertService) {
			return {
				// on success
				response: function (config) {
					var res = config.data;
					switch (res.code) {
						case status.ERR_VALIDATION: {
							var errMsg = '';
							var inputs = res.data;
							for (var i in inputs) {
								errMsg += inputs[i].field + '\n';
								errMsg += '=====================\n';
								var msgs = inputs[i].msg;
								for (var j in msgs) {
									errMsg += msgs[j] + '\n';
								}
								errMsg += '\n';
							}
							alertService.addMessage(res.code, 'Server-side validation error', errMsg);
							break;
						}
					}
					return config;
				},

				// on error
				responseError: function (config) {
					if (config.status == 500) {
						alertService.addMessage(null, 'Error', 'Internal server error');
					}
					return $q.reject(config);
				}
			};
		}])
		// ref: http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
		.factory('tokenInjector', ['authService', function (authService) {
			return {
				request: function (config) {
					var token = authService.getToken();
					// restrict to api scope
					// console.log(config.url.substr(0, 3));
					if (config.url.substr(0, 4) === '/api' && token) {
						config.headers['x-access-token'] = token;
					}
					return config;
				}
			};
		}])
		.factory('alertService', [function () {
			var messages = [];

			return {
				getMessages: function () {
					return messages;
				},
				addMessage: function (type, title, content) {
					messages.push({
						type: type,
						title: title,
						content: content
					});
				},
				deleteMessage: function (idx) {
					messages.splice(idx, 1);
				}
			};
		}])
		.factory('authService', ['$window', function ($window) {
			var store = {};

			store.isAuth = $window.localStorage['isAuth'];
			store.user = $window.localStorage['user'];
			store.token = $window.localStorage['token'];

			store.setToken = function (token) {
				return $window.localStorage['token'] = token;
			};

			store.getToken = function () {
				return $window.localStorage['token'];
			};

			store.login = function (user) {
				$window.localStorage['isAuth'] = true;
				$window.localStorage['user'] = user;
				store.isAuth = true;
				store.user = user;
			};

			store.logout = function () {
				$window.localStorage.removeItem('isAuth');
				$window.localStorage.removeItem('user');
				$window.localStorage.removeItem('token');
				store.isAuth = false;
				store.user = null;
			};

			return store;
		}])
		.factory('userFactory', ['$http', function ($http) {
			var urlBase = '/api/user';
			var fac = {};

			fac.readAll = function () {
				return $http.get(urlBase);
			};

			fac.read = function (id) {
				return $http.get(urlBase + '/' + id);
			};

			fac.create = function (user) {
				return $http.post(urlBase, user);
			};

			fac.login = function (user) {
				return $http.post(urlBase + '/login', user);
			};

			fac.logout = function () {
				return $http.get(urlBase + '/logout');
			};

			fac.reverify = function (data) {
				return $http.post(urlBase + '/reverify', data);
			};

			fac.recovery = function (_email) {
				return $http.post(urlBase + '/recovery', {
					email: _email
				});
			};

			fac.update = function (user) {
				return $http.put(urlBase + '/' + user.user_id, user);
			};

			fac.delete = function (id) {
				return $http.delete(urlBase + '/' + id);
			};

			return fac;
		}]);
}) ();