'use strict';

angular.module('facebookUtils')
  .directive('facebookLogin', ['angularFire', 'facebookSDK', function (angularFire, facebookSDK) {
    return {
      template: '<div id="facebookLogin"><style>.marginTop{margin-top: 10px;}.modal.show{display: block;}.btn-auth,.btn-auth:visited{position: relative;display: inline-block;height: 22px;padding: 0 1em;border: 1px solid #999;border-radius: 2px;margin: 0;text-align: center;text-decoration: none;font-size: 14px;line-height: 22px;white-space: nowrap;cursor: pointer;color: #222;background: #fff;-webkit-box-sizing: content-box;-moz-box-sizing: content-box;box-sizing: content-box;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;-webkit-appearance: none;*overflow: visible;*display: inline;*zoom: 1;}.btn-auth:hover,.btn-auth:focus,.btn-auth:active{color: #222;text-decoration: none;}.btn-auth:before{content: "";float: left;width: 22px;height: 22px;background: url(src/styles/auth-icons.png) no-repeat 99px 99px;}.btn-auth.large{height: 36px;line-height: 36px;font-size: 20px;}.btn-auth.large:before{width: 36px;height: 36px;}.btn-auth::-moz-focus-inner{border: 0;padding: 0;}.btn-facebook,.btn-facebook:visited{border-color: #29447e;border-bottom-color: #1a356e;color: #fff;background-color: #5872a7;background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#637bad), to(#5872a7));background-image: -webkit-linear-gradient(#637bad, #5872a7);background-image: -moz-linear-gradient(#637bad, #5872a7);background-image: -ms-linear-gradient(#637bad, #5872a7);background-image: -o-linear-gradient(#637bad, #5872a7);background-image: linear-gradient(#637bad, #5872a7);-webkit-box-shadow: inset 0 1px 0 #879ac0;box-shadow: inset 0 1px 0 #879ac0;}.btn-facebook:hover,.btn-facebook:focus{color: #fff;background-color: #3b5998;}.btn-facebook:active{color: #fff;background: #4f6aa3;-webkit-box-shadow: inset 0 1px 0 #45619d;box-shadow: inset 0 1px 0 #45619d;}.btn-facebook:before{border-right: 1px solid #465f94;margin: 0 1em 0 -1em;background-position: 0 0;}.btn-facebook.large:before{background-position: 0 -22px;}</style><a ng-click="signInOrConfigure()" data-toggle="modal" data-target="#myModal" class="btn-auth btn-facebook"><span ng-hide="connected"> Sign in with <b>Facebook</b></span><span ng-show="connected"> Sign out </span></a><div class="modal" ng-class="{fade: !showConfigure, show: showConfigure}"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="showConfigure=false">&times;</button><h4 class="modal-title">Configure Facebook Login</h4></div><div class="modal-body"><div> First, you\'ll need to register your app on Facebook. Follow these steps: </div><ol class="marginTop"><li>Visit <a href="https://developers.facebook.com/apps" target="_blank">https://developers.facebook.com/apps</a></li><li>Create New App (Only a name is required.)</li><li>Set "Sandbox Mode" to "Disabled"</li><li>Under "Select how your app integrates with Facebook", expand "Website with Facebook Login".</li><li>Set Site URL to: <span ng-bind="configureLocation">http://localhost:3000/</span></li></ol><div> Now, copy over some details. </div><form role="form" class="marginTop"><div class="form-group"><label for="appIdInput">Facebook App ID:</label><input id="appIdInput" type="text" ng-model="newAppId" class="form-control" placeholder="App ID"></div></form></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="showConfigure=false">I\'ll do this later</button><button type="button" ng-click="saveConfiguration()" class="btn btn-primary">Save configuration</button></div></div></div></div><div id="fb-root"></div></div>',
      restrict: 'E',
      replace: true,
      scope: { },
      link: function postLink($scope, $element, $attrs) {

        facebookSDK.setPermissions($attrs.permissions);

        var needToConfigure = $attrs.showConfigure;

        $scope.signInOrConfigure = function() {
          if (facebookSDK.wasInitialized()) {
            if (!$scope.connected) {
              facebookSDK.login();
            } else {
              facebookSDK.logout();
            }
          } else {
            needToConfigure = true;
            $scope.configureLocation = window.location.origin;
            $scope.showConfigure = true;
          }
        }

        $scope.$on('fbLoginSuccess', function(name, response) {
          $scope.connected = true;
        });

        $scope.$on('fbLogoutSuccess', function() {

          $scope.$apply(function() {
            $scope.connected = false;
          });

        });

        if ($attrs.appId && !needToConfigure) {

          facebookSDK.initializeFb($attrs.appId);

        } else {

          var firebaseUrl = $attrs.firebase;

          if (!firebaseUrl) {
            throw new Error('You\'ll need to either specify a Firebase URL or provide app-id attribute on the directive');
            return;
          }

          var ref = new Firebase(firebaseUrl);

          $scope.facebook = {
            appId : '',
          };

          angularFire(ref, $scope, 'facebook');

          $scope.$watch('facebook', function(val) {
            if (!needToConfigure && val.appId) {
              facebookSDK.initializeFb(val.appId);
            } else if (needToConfigure) {
              $scope.newAppId = $scope.facebook.appId;
            }
          }, true);

          $scope.saveConfiguration = function() {
            if ($scope.newAppId) {
              $scope.facebook.appId = $scope.newAppId;

              facebookSDK.initializeFb($scope.newAppId, true);
              $scope.showConfigure = false;
            }
          }

        }
      }
    };
  }]);
