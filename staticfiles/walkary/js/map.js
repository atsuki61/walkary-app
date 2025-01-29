let map, currentLocationMarker, path, polyline, directionsService, directionsRenderer, geocoder;
let startPoint;
let endPoint;
let startMarker;  // スタート地点のマーカー
let endMarker;    // ゴール地点のマーカー
let mapClickMode = null;
let currentLocation =null; // 現在地を保持する変数
let lastRecordedLocation = null;
let totalWalkedDistance = 0;


let lastUpdateTime = Date.now();
const UPDATE_INTERVAL = 10000; // 10秒ごとに平均を計算
let stationaryTime = 0; // 静止している時間をカウント
const STATIONARY_THRESHOLD = 300000; // 3分静止していたらブレとして扱う
let previousTimestamp = null;
let lastMoveTime = Date.now(); // 最後に移動した時間
const MOVE_HISTORY_TIME = 15000; // 15秒以内に動いた履歴があれば移動と判定

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

let averageFilterLat = new MovingAverageFilter(10); // 10サンプル分の平均
let averageFilterLng = new MovingAverageFilter(10);
let stableLocation = null;

function savePolyline() {
    const polylinePath = polyline.getPath().getArray().map(latLng => ({
        lat: latLng.lat(),
        lng: latLng.lng()
    }));
    localStorage.setItem('polylinePath', JSON.stringify(polylinePath));
    alert('ポリラインが保存されました！');
}
// ローカルストレージからポリラインデータを読み込み
function loadPolyline() {
    const savedPath = localStorage.getItem('polylinePath');
    if (savedPath) {
        const path = JSON.parse(savedPath);
        // 既存のポリラインを削除
        polyline.setMap(null);
        // 新しいポリラインを作成
        polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        polyline.setMap(map);
        // 地図のビューをポリラインに合わせる
        alert('ポリラインが読み込まれました！');
    } else {
        alert('保存されたポリラインがありません。');
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

/*function calculateWalkedDistance() {
    let totalWalkedDistance = 0;

    for (let i = 0; i < path.getLength() - 1; i++) {
        const start = path.getAt(i);
        const end = path.getAt(i + 1);
        totalWalkedDistance += google.maps.geometry.spherical.computeDistanceBetween(start, end);
    }

    console.log(`歩いた距離: ${totalWalkedDistance.toFixed(2)} m`);
    document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;

    return totalWalkedDistance; // 計算結果を返す
}*/

function calculateWalkedDistance() {

    for (let i = 0; i < path.getLength() - 1; i++) {
        const start = path.getAt(i); // 現在のポイント
        const end = path.getAt(i + 1); // 次のポイント
        totalWalkedDistance += google.maps.geometry.spherical.computeDistanceBetween(start, end);
    }

    // 距離を画面に表示
    console.log(`歩いた距離: ${totalWalkedDistance.toFixed(2)} m`);
    document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;

    return totalWalkedDistance;
}


// n秒おきに歩いた距離を更新する関数を呼び出し
setInterval(() => {
    calculateWalkedDistance();
}, 5000);

// updatePosition 関数に歩いた距離の更新を追加
/*function updatePosition(position) {
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

}*/

/*function updatePosition(position) {
    if (position.coords.accuracy > 20) {
        console.warn('Accuracy too low:', position.coords.accuracy);
        return;
    }

    const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // 最初の位置更新時
    if (!lastRecordedLocation) {
        lastRecordedLocation = new google.maps.LatLng(newLocation.lat, newLocation.lng);
        return;
    }

    const newLatLng = new google.maps.LatLng(newLocation.lat, newLocation.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(lastRecordedLocation, newLatLng);

    // 一定距離以上移動した場合のみ記録
    if (distance > 5) { // 5m以上移動した場合に追加
        totalWalkedDistance += distance;
        lastRecordedLocation = newLatLng;
        path.push(newLatLng);
        currentLocationMarker.setPosition(newLocation);

        totalWalkedDistance/50;

        console.log(`累積距離: ${totalWalkedDistance.toFixed(2)} m`);
        document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;
    }
}*/

function updatePosition(position) {
    if (position.coords.accuracy > 10) { // GPS精度が悪い場合は無視
        console.warn('GPS 精度低: ', position.coords.accuracy);
        return;
    }

    const newLat = averageFilterLat.filter(position.coords.latitude);
    const newLng = averageFilterLng.filter(position.coords.longitude);
    const newLatLng = new google.maps.LatLng(newLat, newLng);

    const currentTime = Date.now();
    if (!previousTimestamp) {
        previousTimestamp = currentTime;
        return; // 初回は前回データがないのでスキップ
    }

    const timeDiff = (currentTime - previousTimestamp) / 1000; // 秒単位
    previousTimestamp = currentTime;

    if (!stableLocation) {
        stableLocation = newLatLng;
        lastRecordedLocation = newLatLng;
        return;
    }

    const distance = google.maps.geometry.spherical.computeDistanceBetween(stableLocation, newLatLng);
    const speed = distance / timeDiff; // m/s

    if ((distance > 5 && speed > 0.8) || (currentTime - lastMoveTime < MOVE_HISTORY_TIME)) {
        // 5m以上移動 & 速度が0.8m/s以上 or 15秒以内に動いた履歴がある
        totalWalkedDistance += distance;
        lastRecordedLocation = newLatLng;
        path.push(newLatLng);
        stableLocation = newLatLng; // 安定した位置を更新
        lastMoveTime = currentTime; // 最後の移動時間を更新
        stationaryTime = 0; // 静止時間リセット

        if (currentLocationMarker) {
            currentLocationMarker.setPosition(newLatLng);
        }

        console.log(`累積距離: ${totalWalkedDistance.toFixed(2)} m (速度: ${speed.toFixed(2)} m/s)`);
        document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;
    } else {
        stationaryTime += timeDiff * 1000; // 静止時間をカウント
        console.log(`移動なし（誤差と判定）: ${distance.toFixed(2)} m, 速度: ${speed.toFixed(2)} m/s`);

        if (stationaryTime > STATIONARY_THRESHOLD && (currentTime - lastMoveTime > STATIONARY_THRESHOLD)) {
            console.log("3分間、5m以上の移動がないためGPSのブレと判定し位置更新");
            stableLocation = newLatLng; // 位置をリセット
            stationaryTime = 0; // 静止時間をリセット
        }
    }

    // 一定時間ごとに安定した現在地を更新
    if (currentTime - lastUpdateTime > UPDATE_INTERVAL) {
        stableLocation = newLatLng;
        lastUpdateTime = currentTime;
        // 過去のデータをクリアして次の測定に備える
        averageFilterLat.values = [];
        averageFilterLng.values = [];
    }
}

function save_distance() {
    const totalWalkedDistance = calculateWalkedDistance(); // 計算結果を取得
    localStorage.setItem("walked_distance", JSON.stringify(totalWalkedDistance));
    alert("保存できたよ");

    // 保存後に変更イベントをトリガー
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
