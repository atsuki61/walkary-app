let map, currentLocationMarker, path, polyline, directionsService, directionsRenderer, geocoder;
let startPoint, endPoint, startMarker, endMarker;
let mapClickMode = null;
let currentLocation;
let totalWalkedDistance = 0;

class MovingAverageFilter {
    constructor(size) {
        this.size = size;
        this.values = [];
    }

    filter(value) {
        this.values.push(value);
        if (this.values.length > this.size) {
            this.values.shift();
        }
        const sum = this.values.reduce((a, b) => a + b, 0);
        return sum / this.values.length;
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 35.7447721, lng: 139.8003518 },
        zoom: 14
    });

    geocoder = new google.maps.Geocoder();
    path = new google.maps.MVCArray();
    polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    polyline.setMap(map);

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ draggable: true });
    directionsRenderer.setMap(map);

    google.maps.event.addListener(directionsRenderer, 'directions_changed', () => {
        const result = directionsRenderer.getDirections();
        displayRouteDistance(result);
    });

    google.maps.event.addListener(map, 'click', (event) => {
        if (mapClickMode === 'start') {
            startPoint = event.latLng;
            if (startMarker) startMarker.setMap(null);
            startMarker = addMarker(startPoint, 'スタート地点');
            document.getElementById('start').value = startPoint.toUrlValue();
            mapClickMode = null;
        } else if (mapClickMode === 'end') {
            endPoint = event.latLng;
            if (endMarker) endMarker.setMap(null);
            endMarker = addMarker(endPoint, 'ゴール地点');
            document.getElementById('end').value = endPoint.toUrlValue();
            mapClickMode = null;
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initPosition, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        handleLocationError(false, map.getCenter());
    }
}

function initPosition(position) {
    currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    currentLocationMarker = new google.maps.Marker({
        position: currentLocation,
        map: map,
        title: '現在地 (Current Location)'
    });

    map.setCenter(currentLocation);
    updatePosition(position);

    navigator.geolocation.watchPosition(updatePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

function calculateWalkedDistance() {
    let newWalkedDistance = 0;
    for (let i = 0; i < path.getLength() - 1; i++) {
        const start = path.getAt(i);
        const end = path.getAt(i + 1);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
        if (distance >= 3) {
            newWalkedDistance += distance;
        }
    }
    totalWalkedDistance += newWalkedDistance;
    console.log(`歩いた距離: ${totalWalkedDistance.toFixed(2)} m`);
    document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;
    return totalWalkedDistance;
}

setInterval(calculateWalkedDistance, 5000);

function updatePosition(position) {
    if (position.coords.accuracy > 20) {
        console.warn('Accuracy too low:', position.coords.accuracy);
        return;
    }

    currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    currentLocationMarker.setPosition(currentLocation);
    path.push(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));
}

function saveDistance() {
    localStorage.setItem("walked_distance", JSON.stringify(totalWalkedDistance));
    alert("保存できたよ");
    window.dispatchEvent(new StorageEvent("storage", {
        key: "walked_distance",
        newValue: JSON.stringify(totalWalkedDistance.toFixed(2))
    }));
}

function handleError(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
}

function handleLocationError(browserHasGeolocation, pos) {
    map.setCenter(pos);
    const infoWindow = new google.maps.InfoWindow({
        content: browserHasGeolocation
            ? 'Error: The Geolocation service failed.'
            : 'Error: Your browser doesn\'t support geolocation.'
    });
    infoWindow.setPosition(pos);
    infoWindow.open(map);
}

function setMapClickMode(mode) {
    mapClickMode = mode;
}

function addMarker(position, title) {
    return new google.maps.Marker({
        position: position,
        map: map,
        title: title
    });
}

window.onload = initMap;
