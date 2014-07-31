'use strict';

var app = angular.module('myApp.controllers', []);

app
	.controller('userNewCtrl', ['$scope', 'userFactory', '$location', 'status', function ($scope, userFactory, $location, status) {
		$scope.error = {
			isEmailExist: false,
			msg: ''
		};

		// $scope.form = {
		// 	email:    'test@test.test',
		// 	password: 'testtest',
		// 	confirm:  'testtest',
		// 	name:     'test',
		// 	sex:      1,
		// 	birthday: '',
		// 	phone:    '',
		// 	address:  ''
		// };
		$scope.form = {
			email:    'test@test.test',
			password: 'testtes',
			confirm:  'testtes',
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
							case status.ERR_VALIDATION: {
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
								break;
							}
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
	}]);