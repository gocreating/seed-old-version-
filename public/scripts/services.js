'use strict';

(function () {
	var app = angular.module('myApp.services', []);

	var status = {
		OK:                        200,
		INTERNAL_SERVER_ERROR:     500,
		ERR_VALIDATION:            0x10000002,
		USER_EMAIL_EXIST:          0x10000003,
		USER_WRONG_ACCOUNT:        0x10000004,
		TOKEN_WRONG_FORMAT:        0x10000005,
		TOKEN_EXPIRATION:          0x10000006,
		SUCC_SOCIAL_LOGIN:         0x00000007,
		ERR_SOCIAL_LOGIN:          0x10000008,
		WRONG_CAPTCHA:             0x10000009,
		USER_NOT_VERIFIED:         0x1000000A,
		ERR_EMAIL_SEND:            0x1000000B,
		SUCC_VERIFICATION:         0x0000000C,
		ERR_RE_VERIFICATION:       0x0000000D,
		USER_EMAIL_NOT_EXIST:      0x1000000E,
		RECOVERY_TOKEN_EXPIRATION: 0x1000000F,
		SUCC_RESET:                0x00000010
	};

	app
		.constant('status', status)
		.constant('defaultStyle', 'default');


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
		.factory('codeService', ['$window', function ($window) {
			var code = {};

			// ref: http://my.oschina.net/dzb3688/blog/279770
			var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var base64DecodeChars = new Array(
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
				52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
				-1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
				15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
				-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
				41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
			);

			function base64decode(str) {
				var c1, c2, c3, c4;
				var i, len, out;
				len = str.length;
				i = 0;
				out = "";
				while(i < len) {
					do {
						c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
					} while (i < len && c1 == -1);
					if (c1 == -1)
						break;
					do {
						c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
					} while (i < len && c2 == -1);
					if (c2 == -1)
						break;
					out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
					do {
						c3 = str.charCodeAt(i++) & 0xff;
						if(c3 == 61)
							return out;
						c3 = base64DecodeChars[c3];
					} while (i < len && c3 == -1);
					if (c3 == -1)
						break;
					out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

					do {
						c4 = str.charCodeAt(i++) & 0xff;
						if (c4 == 61)
							return out;
						c4 = base64DecodeChars[c4];
					} while (i < len && c4 == -1);
					if (c4 == -1)
						break;
					out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
				}
				return out;
			}
			//utf8 encode
			function utf8to16 (str) {
				var out, i, len, c;
				var char2, char3;
				out = "";
				len = str.length;
				i = 0;
				while (i < len) {
					c = str.charCodeAt(i++);
					switch (c >> 4) { 
						case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
							// 0xxxxxxx
							out += str.charAt(i-1);
							break;
						case 12: case 13:
							// 110x xxxx   10xx xxxx
							char2 = str.charCodeAt(i++);
							out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
							break;
						case 14:
							// 1110 xxxx  10xx xxxx  10xx xxxx
							char2 = str.charCodeAt(i++);
							char3 = str.charCodeAt(i++);
							out += String.fromCharCode(((c & 0x0F) << 12) |
								((char2 & 0x3F) << 6) |
								((char3 & 0x3F) << 0));
							break;
					}
				}
				return out;
			}

			code.decodeBase64 = function (str) {
				return utf8to16(base64decode(str));
			};

			return code;
		}])
		.factory('authService', ['$window', function ($window) {
			// var store = {};

			// store.isAuth = $window.localStorage['isAuth'];
			// store.user = $window.localStorage['user'];
			// store.token = $window.localStorage['token'];

			// store.setToken = function (token) {
			// 	return $window.localStorage['token'] = token;
			// };

			// store.getToken = function () {
			// 	return $window.localStorage['token'];
			// };

			// store.login = function (user) {
			// 	$window.localStorage['isAuth'] = true;
			// 	$window.localStorage['user'] = user;
			// 	store.isAuth = true;
			// 	store.user = user;
			// };

			// store.logout = function () {
			// 	$window.localStorage.removeItem('isAuth');
			// 	$window.localStorage.removeItem('user');
			// 	$window.localStorage.removeItem('token');
			// 	store.isAuth = false;
			// 	store.user = null;
			// };

			// return store;

			var store = {};

			store.isAuth = $window.localStorage.getItem('isAuth');
			store.user = JSON.parse($window.localStorage.getItem('user'));
			store.token = $window.localStorage.getItem('token');

			store.setToken = function (token) {
				return $window.localStorage.setItem('token', token);
			};

			store.getToken = function () {
				return $window.localStorage.getItem('token');
			};

			store.login = function (user) {
				$window.localStorage.setItem('isAuth', true);
				$window.localStorage.setItem('user', JSON.stringify(user));
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

			fac.recover = function (data) {
				return $http.post(urlBase + '/password/recovery', data);
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