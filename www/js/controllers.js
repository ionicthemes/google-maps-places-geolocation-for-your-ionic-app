angular.module('controllers', [])

.controller('PlaceCtrl', function($scope, place){
  $scope.place = place;
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, NgMap, $ionicLoading, GooglePlacesService){
  // Central Park location
  var central_park = {
    lat: 40.785091,
    lng: -73.968285
  };

  $scope.customMarkers = [
    {
      lat: central_park.lat,
      lng: central_park.lng,
      class: "custom-marker",
      text: "Central Park"
    }
  ];

  // Init the center position for the map
  $scope.latitude = central_park.lat;
  $scope.longitude = central_park.lng;

  // Google Places search
  $scope.search = { input: '' };
  $scope.predictions = [];

  // Keep track of every marker we create. That way we can remove them when needed
  $scope.markers_collection = [];

  // To properly init the google map with angular js
  $scope.init = function(map) {
    // debugger;
    $scope.mymap = map;
    $scope.$apply();
  };

  // var vmap = this;
  // vmap.dynMarkers = [];

  var showPlaceInfo = function(place){
        $state.go('place', {placeId: place.place_id});
      },
      createMarker = function(place){
        // Custom image for marker
        var custom_marker_image = {
          url: '../img/ionic_marker.png',
          size: new google.maps.Size(30, 30),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 30)
        };

        var marker = new google.maps.Marker({
          // map: vmap.map,
          map: $scope.mymap,
          // if place geometry , else (use lat, lng)
          position: place.geometry.location,
          icon: custom_marker_image,
          animation: google.maps.Animation.DROP
        });

        // if place-id
        marker.addListener('click', function() {
          showPlaceInfo(place);
        });

        $scope.markers_collection.push(marker);
        // vmap.dynMarkers.push(marker);

        return marker;
      },
      createCluster = function(markers){
        var markerClusterer = new MarkerClusterer($scope.mymap, markers, {
          styles: [
            {
              url: '../img/i1.png',
              height: 53,
              width: 52,
              textColor: '#FFF',
              textSize: 12
            },
            {
              url: '../img/i2.png',
              height: 56,
              width: 55,
              textColor: '#FFF',
              textSize: 12
            },
            {
              url: '../img/i3.png',
              height: 66,
              width: 65,
              textColor: '#FFF',
              textSize: 12
            },
            {
              url: '../img/i4.png',
              height: 78,
              width: 77,
              textColor: '#FFF',
              textSize: 12
            },
            {
              url: '../img/i5.png',
              height: 90,
              width: 89,
              textColor: '#FFF',
              textSize: 12
            }
          ],
          imagePath: '../img/i'
        });
      };



  // NgMap.getMap().then(function(map){
  //   // debugger;
  //   // var options = {timeout: 10000, enableHighAccuracy: true};
  //   vmap.map = map;
  //   // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
  //   //   $scope.latitude = position.coords.latitude;
  //   //   $scope.longitude = position.coords.longitude;
  //   // })
  //
  //   // vmap.dynMarkers = [];
  //
  //   // vmap.createCluster = function(){
  //   //   var markerClusterer = new MarkerClusterer(vmap.map, vmap.dynMarkers, {
  //   //     styles: [
  //   //       {
  //   //         url: '../img/i1.png',
  //   //         height: 53,
  //   //         width: 52,
  //   //         textColor: '#FFF',
  //   //         textSize: 12
  //   //       },
  //   //       {
  //   //         url: '../img/i2.png',
  //   //         height: 56,
  //   //         width: 55,
  //   //         textColor: '#FFF',
  //   //         textSize: 12
  //   //       },
  //   //       {
  //   //         url: '../img/i3.png',
  //   //         height: 66,
  //   //         width: 65,
  //   //         textColor: '#FFF',
  //   //         textSize: 12
  //   //       },
  //   //       {
  //   //         url: '../img/i4.png',
  //   //         height: 78,
  //   //         width: 77,
  //   //         textColor: '#FFF',
  //   //         textSize: 12
  //   //       },
  //   //       {
  //   //         url: '../img/i5.png',
  //   //         height: 90,
  //   //         width: 89,
  //   //         textColor: '#FFF',
  //   //         textSize: 12
  //   //       }
  //   //     ],
  //   //     imagePath: '../img/i'
  //   //   });
  //   // };
  //
  // });

  // $scope.placeChanged = function() {
  //   vmap.place = this.getPlace();
  //   vmap.map.setCenter(vmap.place.geometry.location);
  //   $scope.searchMarker={"latitude": vmap.place.geometry.location.lat(),
  //                       "longitude": vmap.place.geometry.location.lng()}
  // }

  $scope.centerOnCurrentPosition = function(){
    $ionicLoading.show({
      template: 'Getting current position ...'
    });
    $cordovaGeolocation.getCurrentPosition({
      timeout: 10000,
      enableHighAccuracy: true
    }).then(function(position){
      $ionicLoading.hide().then(function(){
        $scope.latitude = position.coords.latitude;
        $scope.longitude = position.coords.longitude;

        // Custom image for marker
        var custom_marker_image = {
          url: '../img/ionic_marker.png',
          size: new google.maps.Size(30, 30),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 30)
        };

        var marker = new google.maps.Marker({
          map: $scope.mymap,
          position: {lat: position.coords.latitude, lng: position.coords.longitude},
          icon: custom_marker_image,
          animation: google.maps.Animation.DROP
        });

      });
    });
  };

  $scope.getPlacePredictions = function(query){
    if(query !== "")
    {
      GooglePlacesService.getPlacePredictions(query)
      .then(function(predictions){
        $scope.predictions = predictions;
      });
    }else{
      $scope.predictions = [];
    }
  };

  $scope.selectSearchResult = function(result){
    $scope.search.input = result.description;
    $scope.predictions = [];

    // With this result we should find restaurants arround this place and then show them in the map
    // First we need to get LatLng from the place ID
    GooglePlacesService.getLatLng(result.place_id)
    .then(function(result_location){
      // Now we are able to search restaurants near this location
      // result_location.lat()
      // result_location.lng()
      // debugger;

      GooglePlacesService.getPlacesNearby(result_location)
      .then(function(nearby_places){
        // Create a location bound to center the map based on the results
        var bound = new google.maps.LatLngBounds(),
            places_markers = [];

        for (var i = 0; i < nearby_places.length; i++) {
          // debugger;
		      bound.extend(nearby_places[i].geometry.location);
		      var place_marker = createMarker(nearby_places[i]);
          places_markers.push(place_marker);
		    }

        // Create cluster with places
        createCluster(places_markers);

        // debugger;
        var neraby_places_bound_center = bound.getCenter();
        // console.log(bound.getCenter());

        // Center map based on the bound arround nearby places
        $scope.latitude = neraby_places_bound_center.lat();
        $scope.longitude = neraby_places_bound_center.lng();

        // To fit map with places
        $scope.mymap.fitBounds(bound);
      });
    });
  };




})

;
