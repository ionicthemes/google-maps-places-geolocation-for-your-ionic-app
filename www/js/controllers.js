angular.module('controllers', [])

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, NgMap, $ionicLoading){
  // Central Park location
  $scope.latitude = 40.785091;
  $scope.longitude = -73.968285;

  var vmap = this;
  NgMap.getMap().then(function(map){
    // var options = {timeout: 10000, enableHighAccuracy: true};
    vmap.map = map;
    // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    //   $scope.latitude = position.coords.latitude;
    //   $scope.longitude = position.coords.longitude;
    // })


  })

  $scope.customMarkers = [
          {address: "1600 pennsylvania ave, washington DC", "class": "customMarkers", "name": "marker1"},
          {address: "600 pennsylvania ave, washington DC",  "class": "customMarkers", "name": "marker2"},
        ];
  $scope.placeChanged = function() {
    vmap.place = this.getPlace();
    vmap.map.setCenter(vmap.place.geometry.location);
    $scope.searchMarker={"latitude": vmap.place.geometry.location.lat(),
                        "longitude": vmap.place.geometry.location.lng()}
  }

  $scope.centerOnCurrentPosition = function(){
    var options = {
      timeout: 10000,
      enableHighAccuracy: true
    };
    $ionicLoading.show({
      template: 'Getting current position ...'
    });
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      $ionicLoading.hide().then(function(){
        $scope.latitude = position.coords.latitude;
        $scope.longitude = position.coords.longitude;
      });
    });
  };


});
