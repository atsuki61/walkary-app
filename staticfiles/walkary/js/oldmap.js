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

// updatePosition 関数に歩いた距離の更新を追加
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

    // 歩いた距離を更新
    calculateWalkedDistance();
}


function calculateWalkedDistance() {
    let totalWalkedDistance = 0;

    for (let i = 0; i < path.getLength() - 1; i++) {
        const start = path.getAt(i);
        const end = path.getAt(i + 1);
        totalWalkedDistance += google.maps.geometry.spherical.computeDistanceBetween(start, end);
    }

    totalWalkedDistance /= 1000;

    console.log(`歩いた距離: ${totalWalkedDistance.toFixed(2)} km`);
    document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} km`;
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

    updateWaypointAndDistanceState();

    const waypointAddress = document.getElementById('waypoint').value; // 経由地点の追加
    const distance = parseFloat(document.getElementById('distance').value);

    if (isNaN(distance) || distance < 1 || distance > 20) {
        alert('有効な距離を1km以上20km以下で入力してください');
        return;
    }

    const handleRouteGeneration = (waypointLocation) => {
        if (!startPoint) startPoint = currentLocation;
        if (!endPoint) endPoint = currentLocation;

        if (startMarker) startMarker.setMap(null);
        if (endMarker) endMarker.setMap(null);

        let waypoints = [];
        if (waypointLocation) {
            waypoints = [{ location: waypointLocation, stopover: true }];
        } else {
            waypoints = generateWaypoints(startPoint, endPoint, distance);
        }

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
                displayRouteDistance(result);
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
                    if (waypointAddress) {
                        geocodeAddress(waypointAddress, (waypointLocation) => {
                            handleRouteGeneration(waypointLocation);
                        });
                    } else {
                        handleRouteGeneration();
                    }
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
        // const segmentDistance = distance / segments;

        if (distanceBetweenPoints >= distance) {
            for (let i = 1; i < segments; i++) {
                const fraction = i / segments;
                const intermediatePoint = google.maps.geometry.spherical.interpolate(start, end, fraction);
                waypoints.push({
                    location: intermediatePoint,
                    stopover: false
                });
            }
        } else {
            return waypoints;
        }
    } else {
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
    let totalDuration = 0;
    const legs = result.routes[0].legs;

    for (let i = 0; i < legs.length; i++) {
        totalDistance += legs[i].distance.value;  // 距離 (メートル)
        totalDuration += legs[i].duration.value;  // 所要時間 (秒)
    }

    totalDistance /= 1000;  // メートルからキロメートルに変換
    const hours = Math.floor(totalDuration / 3600);  // 秒を時間に変換
    const minutes = Math.floor((totalDuration % 3600) / 60);  // 残りの秒数を分に変換

    document.getElementById('route-distance').innerText = `ルートの距離: ${totalDistance.toFixed(2)} km`;
    document.getElementById('route-duration').innerText = `所要時間: ${hours} 時間 ${minutes} 分`;
}

// スタート地点かゴール地点のどちらかが入力されているかチェック
function updateWaypointAndDistanceState() {
    const startInput = document.getElementById('start').value.trim();
    const endInput = document.getElementById('end').value.trim();
    const waypointInputValue = document.getElementById('waypoint').value.trim();

    console.log('Start Input:', startInput);
    console.log('End Input:', endInput);
    console.log('waypoint Input:', waypointInputValue);

    const waypointInput = document.getElementById('waypoint');
    const distanceInput = document.getElementById('distance');

    if (startInput && endInput) {
        if (startInput === endInput) {
            if (waypointInputValue) {
                waypointInput.disabled = false;
                distanceInput.disabled = true;
            } else {
                waypointInput.disabled = false;
                distanceInput.disabled = false;
            }
        } else {
            waypointInput.disabled = false;
            distanceInput.disabled = true;
        }
    } else {
        waypointInput.disabled = true;
        distanceInput.disabled = false;
    }
}

// ページ読み込み時に初期状態を確認
document.addEventListener("DOMContentLoaded", updateWaypointAndDistanceState);

// 入力フィールドの変更時にチェックを実行
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start').addEventListener('input', updateWaypointAndDistanceState);
    document.getElementById('end').addEventListener('input', updateWaypointAndDistanceState);
    document.getElementById('waypoint').addEventListener('input', updateWaypointAndDistanceState);
});

window.onload = initMap;
