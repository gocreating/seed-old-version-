'use strict';

var app = angular.module('myApp.services', []);

var extract = function () {
	
};

app
	.constant('status', {
		ERR_SERVER: 0x00000001,
		ERR_VALIDATION: 0x00000002,
		ERR_USER_EMAIL_EXIST:  0x00000003
	});

// ref: http://weblogs.asp.net/dwahlin/using-an-angularjs-factory-to-interact-with-a-restful-service
app
	.factory('errorHandle', [function () {
		return function (err) {
			console.log('something wrong happened:');
			console.log(err);
		}
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

		fac.update = function (user) {
			return $http.put(urlBase + '/' + user.user_id, user);
		};

		fac.delete = function (id) {
			return $http.delete(urlBase + '/' + id);
		};

		return fac;
	}]);