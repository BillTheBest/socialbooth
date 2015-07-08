angular.module('app', [])
 
  .controller('SocialBooth', function($scope, $locale, $http, $templateCache) {

    $scope.feedPosts_Prev = [];
    $scope.feedVideos_Prev = [];
    $scope.feedImages_Prev = [];

    $scope.loadPosts = function() {
      $http({method: 'GET', url: 'feeds/feedSocial.json', cache: $templateCache}).
        success(function(data) {
          $scope.feedPosts_Prev = $scope.feedPosts;
          $scope.feedPosts = data;
        }).
        error(function(data, status) {
          alert(status + ' - Could not load posts');
      });
    };

    $scope.loadVideos = function() {
      $http({method: 'GET', url: 'feeds/feedVideos.json', cache: $templateCache}).
        success(function(data) {
          $scope.feedVideos_Prev = $scope.feedVideos;
          $scope.feedVideos = data;
        }).
        error(function(data, status) {
          alert(status + ' - Could not load videos');
      });
    };

    $scope.loadImages = function() {
      $http({method: 'GET', url: 'feeds/feedImages.json', cache: $templateCache}).
        success(function(data) {
          $scope.feedImages_Prev = $scope.feedImages;
          $scope.feedImages = data;
        }).
        error(function(data, status) {
          alert(status + ' - Could not load images');
      });
    };
  });