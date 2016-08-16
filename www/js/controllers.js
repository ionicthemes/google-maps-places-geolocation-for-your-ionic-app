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
  $scope.markers_cluster = null;

  // To properly init the google map with angular js
  $scope.init = function(map) {
    $scope.mymap = map;
    $scope.$apply();
  };

  var showPlaceInfo = function(place){
        $state.go('place', {placeId: place.place_id});
      },
      cleanMap = function(){
        // Remove the markers from the map and from the array
        while($scope.markers_collection.length){
          $scope.markers_collection.pop().setMap(null);
        }

        // Remove clusters from the map
        if($scope.markers_cluster !== null){
          $scope.markers_cluster.clearMarkers();
        }
      },
      createMarker = function(place){
        // Custom image for marker
        var custom_marker_image = {
              url: '../img/ionic_marker.png',
              size: new google.maps.Size(30, 30),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 30)
            },
            marker_options = {
              map: $scope.mymap,
              icon: custom_marker_image,
              animation: google.maps.Animation.DROP
            };

        // Handle both types of markers, places markers and location (lat, lng) markers
        if(place.geometry){
          marker_options.position = place.geometry.location;
        }
        else {
          marker_options.position = place;
        }

        var marker = new google.maps.Marker(marker_options);

        // For the places markers we are going to add a click event to display place details
        if(place.place_id){
          marker.addListener('click', function() {
            showPlaceInfo(place);
          });
        }

        $scope.markers_collection.push(marker);

        return marker;
      },
      createCluster = function(markers){
        // var markerClusterer = new MarkerClusterer($scope.mymap, markers, {
        $scope.markers_cluster = new MarkerClusterer($scope.mymap, markers, {
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

  $scope.tryGeoLocation = function(){
    $ionicLoading.show({
      template: 'Getting current position ...'
    });

    // Clean map
    cleanMap();
    $scope.search.input = "";

    $cordovaGeolocation.getCurrentPosition({
      timeout: 10000,
      enableHighAccuracy: true
    }).then(function(position){
      $ionicLoading.hide().then(function(){
        $scope.latitude = position.coords.latitude;
        $scope.longitude = position.coords.longitude;

        createMarker({lat: position.coords.latitude, lng: position.coords.longitude});
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
      GooglePlacesService.getPlacesNearby(result_location)
      .then(function(nearby_places){
        // Clean map
        cleanMap();

        // Create a location bound to center the map based on the results
        var bound = new google.maps.LatLngBounds(),
            places_markers = [];

        for (var i = 0; i < nearby_places.length; i++) {
		      bound.extend(nearby_places[i].geometry.location);
		      var place_marker = createMarker(nearby_places[i]);
          places_markers.push(place_marker);
		    }

        // Create cluster with places
        createCluster(places_markers);

        var neraby_places_bound_center = bound.getCenter();

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
