var map;
var infowindow;

var oauth_consumer_key = 'VAXC8AUEzlaAhwzlweutMQ';
var oauth_token = 'b80Zp7I7NH8JdauereVd1lggnEA5t0gu';
var oauth_consumer_secret = 'CK2TxYFAp8Ht_qIlfnb1IUprPgI';
var oauth_token_secret = '8IcYvPXWFZ81q_FkI_QUIkRv2EE';

function initMap() {
    map = new google.maps.Map($('#map')[0], {
        center: {lat: 37.226874, lng: -121.776858},
        zoom: 16
    });

    ready();
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

var generateNonce = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


function ready() {
    info = new google.maps.InfoWindow();

    function showInfo(marker) {
        var httpMethod = 'GET';
        var yelpURL = 'https://api.yelp.com/v2/search';     
        var nonce = generateNonce(16);
        var timestamp = Math.round(Date.now() / 1000);
    
        var auth = {
            consumerKey : oauth_consumer_key,
            consumerSecret : oauth_consumer_secret,
            accessToken : oauth_token,
            accessTokenSecret : oauth_token_secret,
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };

        var terms = marker.title.split(" ").join("+");
        var near = '95119';

        var accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };

        var parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', near]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = {
            'action' : 'https://api.yelp.com/v2/search',
            'method' : 'GET',
            'parameters' : parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);

        $.ajax({
            'url' : message.action,
            'data' : parameterMap,
            'dataType' : 'jsonp',
            'jsonpCallback' : 'cb',
            'cache' : true
        })
        .done(function(data, textStatus, jqXHR) {
            var business = data.businesses[0];
            var yelpInfo = '<b>' + business.name + '</b>' +
                '<br> Rating: ' + business.rating + '/5';
            info.setContent(yelpInfo);
            info.open(map, marker);
        });
    }

    function Marker(latitude, longitude, name) {
        var self = this;

        self.latitude = latitude;
        self.longitude = longitude;
        self.name = name;
        self.marker = new google.maps.Marker({
            position: new google.maps.LatLng(self.latitude, self.longitude),
            map: map,
            title: self.name,
            animation: google.maps.Animation.DROP
        });

        self.marker.addListener('click', function() {
            toggleBounce(this);
            showInfo(this);
        });
    }

    function MarkersViewModel() {
        var self = this;

        self.markerData = [
            [37.223869, -121.783142, 'Julia Baldwin Elementary School'],
            [37.226729, -121.774046, 'Santa Teresa Village Shopping Center'],
            [37.225473, -121.768037, 'Martin Murphy Middle School'],
            [37.227626, -121.769455, 'Los Paseos Elementary School'],
            [37.228744, -121.776642, 'American Kickboxing Academy']
        ];

        self.markers = [];

        self.openMarker = function(marker, event) {
            toggleBounce(marker.marker);
            showInfo(marker.marker);
            var listItem = $(event.target);
            listItem.addClass('active');
            $('.list-group-item').not(listItem).removeClass('active');            
        }

        for (var i = 0; i < self.markerData.length; i++) {
            var marker = self.markerData[i];
            self.markers.push(new Marker(marker[0], marker[1], marker[2]));
        }
    }

    ko.applyBindings(new MarkersViewModel());
}
