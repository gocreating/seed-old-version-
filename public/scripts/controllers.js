'use strict';

var app = angular.module('myApp.controllers', []);

app
	.controller('userNewCtrl', ['$scope', 'userFactory', '$location', function ($scope ,userFactory, $location) {
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
						$scope.error.isEmailExist = true;
						$scope.error.msg = data.msg;
					} else {
						console.log(data.value);
						$location.path('/user/login');
					}
				});
		};		
	}]);