angular.module('app', ['angular-underscore','ngVideo'])

  .directive('socialItem', function($timeout){
    return {
      restrict: 'A',
      link: function($scope, element){
        $scope.getSocial = $timeout(function(){
          $scope.feedPostsHeight.push(element.outerHeight(true));
          if ($scope.$last){
            $scope.sortSocial($scope.feedPostsHeight);
          }
        });
      }
    };
  })

  .directive('imageItem', function($timeout){
    return {
      restrict: 'A',
      link: function($scope, element){
        $scope.getImages = $timeout(function(){
          $scope.feedImagesHeight.push(element.outerHeight(true));
          if ($scope.$last){
            $scope.sortImages($scope.feedImagesHeight);
          }
        });
      }
    };
  })
 
  .controller('SocialBooth', function($scope, $locale, $http, $timeout, $window) {
    $scope.postStatus = 'init';
    $scope.imageStatus = 'init';
    $scope.delaySlide = 3600;
    $scope.animationSpeed = 1000;
    $scope.minPosts = 0;
    $scope.minVideos = 0;
    $scope.minImages = 0;
    $scope.feedPosts = [];
    $scope.feedVideos = [];
    $scope.feedImages = [];
    $scope.feedPostsHeight = [];
    $scope.feedVideosHeight = [];
    $scope.feedImagesHeight = [];








    function updatePosts(data){
      $scope.feedPostsHeight = [];
      $scope.feedPosts = data;
    }

    function updateImages(data){
      $scope.feedImagesHeight = [];
      $scope.feedImages = data;
    }

    $scope.loadPosts = function() {
      $http({method: 'GET', url: 'feeds/feedSocial.json'}).
        success(function(data) {
          if ($scope.postStatus === 'init') {
            $scope.postStatus = 'running';
            updatePosts(data);
          }
          else if (data.length < $scope.minPosts){
            if (String($scope.feedPosts) !== String(data) && $scope.postStatus !== 'delayed'){
              $scope.feedPosts.push.apply($scope.feedPosts, data);
              $scope.postStatus = 'delayed';
            } else {
              $timeout(function(){
                $scope.loadPosts();
              }, $scope.delaySlide * 3);
            }
          } else {
            $scope.feedPosts.push.apply($scope.feedPosts, data);
            $scope.postStatus = 'running';
          }
        }).
        error(function(data, status) {
          alert(status + ' - Could not load posts');
      });
    };





    $scope.loadVideos = function() {
      $http({method: 'GET', url: 'feeds/feedVideos.json'}).
        success(function(data) {
          $scope.feedVideos = {
            "name": data[0].name,
            "src": data[0].src
          };


          angular.element('#videoPlay').html('<p class="video-name">'+$scope.feedVideos.name+'</p><video width="100%" height="auto" controls autoplay onended="updateVideo()"><source src="'+$scope.feedVideos.src+'" type="video/mp4">Your browser does not support</video>');

          
          $timeout(function(){
            angular.element('#videoPlay source').attr('src', data[0].src);
          });

        }).
        error(function(data, status) {
          alert(status + ' - Could not load videos');
      });
    };

    $scope.updateVideoAng = function() {

      alert('done');
    }





    $scope.loadImages = function() {
      $http({method: 'GET', url: 'feeds/feedImages.json'}).
        success(function(data) {
          if ($scope.imageStatus === 'init') {
            $scope.imageStatus = 'running';
            updateImages(data);
          }
          else if (data.length < $scope.minImages){
            if (String($scope.feedImages) !== String(data) && $scope.imageStatus !== 'delayed'){
              $scope.feedImages.push.apply($scope.feedImages, data);
              $scope.imageStatus = 'delayed';
            } else {
              $timeout(function(){
                $scope.loadImages();
              }, $scope.delaySlide * 3);
            }
          } else {
            $scope.feedImages.push.apply($scope.feedImages, data);
            $scope.imageStatus = 'running';
          }
        }).
        error(function(data, status) {
          alert(status + ' - Could not load images');
      });
    };

    function removePost(){
      angular.element('#social0').slideUp(1000, function(){
        $scope.feedPosts.shift();
        $scope.feedPostsHeight.shift();
        $scope.$apply();

        if ($scope.feedPosts.length <= $scope.minPosts){
          $scope.loadPosts();
        } else {
          $scope.sortSocial($scope.feedPostsHeight);
        }
      });
    }

    function removeImage(){
      angular.element('#image0').slideUp(1000, function(){
        $scope.feedImages.shift();
        $scope.feedImagesHeight.shift();
        $scope.$apply();

        if ($scope.feedImages.length <= $scope.minImages){
          $scope.loadImages();
        } else {
          $scope.sortImages($scope.feedImagesHeight);
        }
      });
    }

    $scope.sortSocial = function(data){
      var findMin = 0;
      var findVH = $window.innerHeight;

      for (var i = 0; i < data.length; i++) {
        findMin += data[i];
        if (findMin >= findVH){
          $scope.minPosts = Math.round(i) * 1.5;

          if ($scope.postStatus === 'delayed'){
            $scope.minPosts = Math.round(i);
          }

          i = data.length;
          $timeout(function(){
            removePost();
          }, $scope.delaySlide * 1.33);
        }
      }
      if (findMin < findVH){
        $scope.minPosts = Math.round(findVH / findMin) * i;

        $timeout(function(){
          $scope.loadPosts();
        }, $scope.delaySlide);
      }
    };

    $scope.sortImages = function(data){
      var findMin = 0;
      var findVH = $window.innerHeight;

      for (var i = 0; i < data.length; i++) {
        findMin += data[i];
        if (findMin >= findVH){
          $scope.minImages = Math.round(i) * 1.5;

          if ($scope.imageStatus === 'delayed'){
            $scope.minImages = Math.round(i);
          }

          i = data.length;
          $timeout(function(){
            removeImage();
          }, $scope.delaySlide);
        }
      }
      if (findMin < findVH){
        $scope.minImages = Math.round(findVH / findMin) * i;

        $timeout(function(){
          $scope.loadImages();
        }, $scope.delaySlide);
      }
    };
  });