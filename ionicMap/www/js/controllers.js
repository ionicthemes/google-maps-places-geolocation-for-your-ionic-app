angular.module('controllers', [])

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, NgMap) {
  // var options = {timeout: 10000, enableHighAccuracy: true};
  //
  // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
  //   var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //   var mapOptions = {
  //     center: latLng,
  //     zoom: 15,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   };
  //   // $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  // }, function(error){
  //   console.log("Could not get location");
  // });

  var vmap = this
  NgMap.getMap().then(function(map){
    var options = {timeout: 10000, enableHighAccuracy: true};
    vmap.map = map;
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      $scope.latitude = position.coords.latitude;
      $scope.longitude = position.coords.longitude;
    })

  $scope.placeChanged = function() {
    vmap.place = this.getPlace();
    console.log('location', vmap.place.geometry.location);
    vmap.map.setCenter(vmap.place.geometry.location);
  }
  })
});
