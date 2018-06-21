// yelp_token, google_api_key
// TODO: remove cl and all logs
var cl = function(i){
  console.log(i);
};


cl(yelp_api_key);
cl(google_api_key);

var fav_strings = ['Curry Up Now, San Mateo', 'El Castillito, Church St, San Francisco', 'Souvla, Hayes, San Francisco'];

var geocoder;
var map;

// --


function addYelpRating(restaurant, yelp_api){
  var token = 'Bearer ' + yelp_api;
  $.ajax({
      url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search',
      headers: {'Authorization': token},
      dataType: "json",
      data: {
          term: restaurant.name,
          location: restaurant.address
      },
      success: function( response ) {
          console.log( response.businesses[0].rating ); // server response
          restaurant["yelp_rating"] = response.businesses[0].rating;
      }
  });
};

var addZomatoRatingtoLocs = function(locs){
  locs.forEach(function(loc){
    var marker = new google.maps.Marker({
      position: loc.position,
      map: map,
      title: loc.name
    });
  });
}

var getLocs = function(){
  geocoder = new google.maps.Geocoder();
  var requests = [];
  fav_strings.forEach(function(name){
    requests.push({address: name})
  });
  function geocodes_complete_callback(){
    model.addYelpRatingtoLocs(model.locs);
  }

  model.locs = [];
  requests.forEach(function(request){
    var current = {};
    geocoder.geocode( { 'address': request.address}, function(results, status) {
      current["address"] = results[0].formatted_address;
      current["position"] = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}
      var placesService = new google.maps.places.PlacesService(map);
      placesService.textSearch({
          query: request.address
        }, function(iresults, status) {
          cl(iresults);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            current['name'] = iresults[0].name;
            model.locs.push(current);
            var restaurant = model.locs[model.locs.length - 1];
            addYelpRating(restaurant, yelp_api_key);
            if (model.locs.length >= requests.length){ geocodes_complete_callback();};
          }
        });
  });
  });
};

var loadGoogle = function(){
  var tag = document.createElement('script');
  tag.async = true;
  tag.defer = true;
  tag.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key='+ google_api_key +'&v=3&callback=googleLoadedCallback';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};


function initMap(styles) {
  var initial_zoom = 11;
  if (window.innerWidth < 330 ){
    initial_zoom = 10.5;
  }
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.685839, lng: -122.366792},
    zoom: initial_zoom,
    styles: styles,
    mapTypeControl: false,
  });
};

function googleLoadedCallback(){
  initMap(styles);
  getLocs();
};






var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];
