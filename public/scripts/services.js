'use strict';

(function () {
	var app = angular.module('myApp.services', []);

	var status = {
		ERR_SERVER:		   0x00000001,
		ERR_VALIDATION:	   0x00000002,
		ERR_USER_EMAIL_EXIST: 0x00000003,
		ERR_USER_LOGIN: 0x00000004
	};

	app
		.constant('status', status);

	// ref: http://stackoverflow.com/questions/11956827/angularjs-intercept-all-http-json-responses
	app
		.factory('httpErrorHandle', [function ($q) {
			return {
				// on success
				response: function (res) {
					var sts = res.status;
					var data = res.data;

					if (data.error && data.errCode == status.ERR_VALIDATION) {
						var errMsg = '';
						var inputs = data.value;
						for (var i in inputs) {
							errMsg += inputs[i].field + '\n';
							errMsg += '=====================\n';
							var msgs = inputs[i].msg;
							for (var j in msgs) {
								errMsg += msgs[j] + '\n';
							}
							errMsg += '\n';
						}
						alert(errMsg);	
					}
					return res;
				},

				// on error
				responseError: function (res) {
					return $q.reject(res);
				}
			};
		}])
		// ref: http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
		.factory('tokenInjector', ['authService', function (authService) {
			return {
				request: function (config) {
					var token = authService.getToken();
					if (token) {
						config.headers['x-session-token'] = token;
					}
					return config;
				}
			};
		}])
		// ref: http://stackoverflow.com/questions/17408475/how-to-keep-login-status-after-refresh-using-angular-js
		// ref: http://maffrigby.com/maintaining-session-info-in-angularjs-when-you-refresh-the-page/
		.factory('authService', ['$cookieStore', function ($cookieStore) {
			var store = {};

			store.isAuth = $cookieStore.get('isAuth');
			store.user = $cookieStore.get('user');

			store.setToken = function (token) {
				return $cookieStore.put('token', token);
			};

			store.getToken = function () {
				return $cookieStore.get('token');
			};

			store.login = function (user) {
				$cookieStore.put('isAuth', true);
				$cookieStore.put('user', user);
				store.isAuth = true;
				store.user = user;
			};

			store.logout = function () {
				$cookieStore.remove('isAuth');
				$cookieStore.remove('user');
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

			fac.update = function (user) {
				return $http.put(urlBase + '/' + user.user_id, user);
			};

			fac.delete = function (id) {
				return $http.delete(urlBase + '/' + id);
			};

			return fac;
		}]);
}) ();