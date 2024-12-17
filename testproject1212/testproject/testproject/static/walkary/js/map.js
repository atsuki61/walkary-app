let map, currentLocationMarker, path, polyline, directionsService, directionsRenderer, geocoder;
let startPoint = null;
let endPoint = null;
let startMarker = null;  // スタート地点のマーカー
let endMarker = null;    // ゴール地点のマーカー
let mapClickMode = null;
let currentLocation = null; // 現在地を保持する変数

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
        zoom: 13
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
            if (startMarker) {
                startMarker.setMap(null);  // 既存のマーカーを削除
            }
            startMarker = addMarker(startPoint, 'スタート地点');
            document.getElementById('start').value = startPoint.toUrlValue();
            mapClickMode = null;
        } else if (mapClickMode === 'end') {
            endPoint = event.latLng;
            if (endMarker) {
                endMarker.setMap(null);  // 既存のマーカーを削除
            }
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
        title: '現在地(Current Location)'
    });
    map.setCenter(currentLocation);
    updatePosition(position);
    navigator.geolocation.watchPosition(updatePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

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

function generateRoute() {
    const startAddress = document.getElementById('start').value;
    const endAddress = document.getElementById('end').value;
    const distance = parseFloat(document.getElementById('distance').value);

    if (isNaN(distance) || distance < 1 || distance > 20) {
        alert('有効な距離を1km以上20km以下で入力してください');
        return;
    }

    const handleRouteGeneration = () => {
        if (!startPoint) startPoint = currentLocation;
        if (!endPoint) endPoint = currentLocation;

        // 既存のマーカーを削除
        if (startMarker) {
            startMarker.setMap(null);
            startMarker = null;
        }
        if (endMarker) {
            endMarker.setMap(null);
            endMarker = null;
        }

        const waypoints = generateWaypoints(startPoint, endPoint, distance);
        const request = {
            origin: startPoint,
            destination: endPoint,
            waypoints: waypoints,
            travelMode: 'WALKING',
            optimizeWaypoints: false
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);

                // 新しいマーカーを追加
                startMarker = new google.maps.Marker({
                    position: result.routes[0].legs[0].start_location,
                    map: map,
                    title: 'スタート地点'
                });

                endMarker = new google.maps.Marker({
                    position: result.routes[0].legs[result.routes[0].legs.length - 1].end_location,
                    map: map,
                    title: 'ゴール地点'
                });

                displayRouteDistance(result, distance);
            } else {
                alert('ルートの生成に失敗しました: ' + status);
            }
        });
    };

    if (startAddress) {
        geocodeAddress(startAddress, (location) => {
            startPoint = location;
            if (endAddress) {
                geocodeAddress(endAddress, (location) => {
                    endPoint = location;
                    handleRouteGeneration();
                });
            } else {
                handleRouteGeneration();
            }
        });
    } else {
        handleRouteGeneration();
    }
}

function geocodeAddress(address, callback) {
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
            callback(results[0].geometry.location);
        } else {
            alert(address + 'の住所を解決できませんでした: ' + status);
        }
    });
}

function generateWaypoints(start, end, distance) {
    const waypoints = [];
    const distanceBetweenPoints = google.maps.geometry.spherical.computeDistanceBetween(start, end) / 1000; // km
    const segments = 4;

    if (distanceBetweenPoints * 1000 > 100) {
        // スタート地点とゴール地点が100m以上離れている場合
        const segmentDistance = distance / segments;

        if (distanceBetweenPoints >= distance) {
            // 実際の距離が目標距離よりも長い場合
            for (let i = 1; i < segments; i++) {
                const fraction = i / segments;
                const intermediatePoint = google.maps.geometry.spherical.interpolate(start, end, fraction);
                waypoints.push({
                    location: intermediatePoint,
                    stopover: false
                });
            }
        } else {
            // 実際の距離が目標距離よりも短い場合
            return waypoints;
        }
    } else {
        // スタート地点とゴール地点が100m未満の場合
        const segmentDistance = (distance * 1000) / segments;
        let currentPoint = start;
        for (let i = 0; i < segments; i++) {
            const angle = i * 90;
            currentPoint = google.maps.geometry.spherical.computeOffset(currentPoint, segmentDistance, angle);
            waypoints.push({
                location: currentPoint,
                stopover: false
            });
        }
    }

    return waypoints;
}

function displayRouteDistance(result) {
    let totalDistance = 0;
    const legs = result.routes[0].legs;

    for (let i = 0; i < legs.length; i++) {
        totalDistance += legs[i].distance.value;
    }

    totalDistance /= 1000; // メートルからキロメートルに変換
    document.getElementById('route-distance').innerText = `ルートの距離: ${totalDistance.toFixed(2)} km`;
}

window.onload = initMap;
