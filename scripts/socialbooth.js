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

  .directive('videoItem', function($http){
    return {
      link: function($scope, element, attrs){
        function getData(){ 
          $http({method: 'GET', url: 'feeds/feedVideos.json'}).
            success(function(data) {
              $scope.updateVideos(data.feed);
              $scope.$watch('videoElem', function(){
                element.bind('ended', function(){
                  if (data.feed.length - 1 > $scope.currVideoID) {
                    $scope.currVideoID++;
                    $scope.updateVideos(data.feed);
                  } else {
                    $scope.currVideoID = 0;
                    getData();
                  }
                });      
              });
            }).
            error(function(data, status) {
              alert(status + ' - Could not load videos');
          });
        }
        getData();
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
    $scope.currVideoSrc = '';
    $scope.currVideoName = '';
    $scope.currVideoID = 0;
    $scope.minPosts = 0;
    $scope.minImages = 0;
    $scope.feedPosts = [];
    $scope.feedVideos = [];
    $scope.feedImages = [];
    $scope.feedPostsHeight = [];
    $scope.feedImagesHeight = [];

    function updatePosts(data){
      $scope.feedPostsHeight = [];
      $scope.feedPosts = data;
    }

    function updateImages(data){
      $scope.feedImagesHeight = [];
      $scope.feedImages = data;
    }

    $scope.updateVideos = function(data){

      // $scope.currVideoName = data[$scope.currVideoID].name;
      angular.element('#videoPlay video').html('<source src="'+data[$scope.currVideoID].filename+'" type="video/mp4">Your browser does not support');
      angular.element('#videoPlay').fadeOut($scope.animationSpeed, function(){
        angular.element('#videoPlay video').get(0).load();
        angular.element('#videoPlay').fadeIn($scope.animationSpeed);
      });
    };

    $scope.loadPosts = function() {
      $http({method: 'GET', url: 'feeds/feedSocial.json'}).
        success(function(data) {

          if ($scope.postStatus === 'init') {
            $scope.postStatus = 'running';
            updatePosts(data.feed);
          }
          else if (data.length < $scope.minPosts){
            if (String($scope.feedPosts) !== String(data) && $scope.postStatus !== 'delayed'){
              $scope.feedPosts.push.apply($scope.feedPosts, data.feed);
              $scope.postStatus = 'delayed';
            } else {
              $timeout(function(){
                $scope.loadPosts();
              }, $scope.delaySlide * 3);
            }
          } else {
            if (data.playListOrder === 'random'){
              var tempArray = [];
              for (var i = 0; i < $scope.minPosts; i++){
                tempArray.push(data.feed[Math.floor(Math.random() * data.feed.length)]);
              }
              $scope.feedPosts.push.apply($scope.feedPosts, tempArray);
              $scope.postStatus = 'running';
            } else {
              $scope.feedPosts.push.apply($scope.feedPosts, data.feed);
              $scope.postStatus = 'running';
            }
          }
        }).
        error(function(data, status) {
          alert(status + ' - Could not load posts');
      });
    };

    $scope.loadImages = function() {
      $http({method: 'GET', url: 'feeds/feedImages.json'}).
        success(function(data) {
          if ($scope.imageStatus === 'init') {
            $scope.imageStatus = 'running';
            updateImages(data.feed);
          }
          else if (data.length < $scope.minImages){
            if (String($scope.feedImages) !== String(data) && $scope.imageStatus !== 'delayed'){
              $scope.feedImages.push.apply($scope.feedImages, data.feed);
              $scope.imageStatus = 'delayed';
            } else {
              $timeout(function(){
                $scope.loadImages();
              }, $scope.delaySlide * 3);
            }
          } else {
            $scope.feedImages.push.apply($scope.feedImages, data.feed);
            $scope.imageStatus = 'running';
          }
        }).
        error(function(data, status) {
          alert(status + ' - Could not load images');
      });
    };

    $scope.removePost = function(){
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

    $scope.removeImage = function(){
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
            $scope.removePost();
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
            $scope.removeImage();
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