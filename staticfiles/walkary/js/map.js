let map, currentLocationMarker, path, polyline, directionsService, directionsRenderer, geocoder;
let startPoint;
let endPoint;
let startMarker;  // スタート地点のマーカー
let endMarker;    // ゴール地点のマーカー
let mapClickMode = null;
let currentLocation; // 現在地を保持する変数
let walkedDistance = 0; // 歩いた総距離（メートル）

let lastLocation = null; // 最後の位置を保持
let lastUpdateTime = null; // 最後に更新した時刻
const maxSpeedThreshold = 10; // 最大許容速度（m/s）
const minDistanceThreshold = 5; // 最小移動距離（メートル）
const updateInterval = 5000; // 更新間隔（ミリ秒）


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
    //ポリラインデータ読み込み開始
    //ポリラインデータ読み込み終了
    polyline.setMap(map);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ draggable: true });
    directionsRenderer.setMap(map);

    //ポリラインデータ書き出し開始
    //ポリラインデータ書き出し終了

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

// function initPosition(position) {
//     currentLocation = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//     };
//     currentLocationMarker = new google.maps.Marker({
//         position: currentLocation,
//         map: map,
//         title: '現在地(Current Location)'
//     });
//     map.setCenter(currentLocation);
//     updatePosition(position);
//     navigator.geolocation.watchPosition(updatePosition, handleError, {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0
//     });
// }

// initPosition 関数
function initPosition(position) {
    const currentLocation = {
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

    // 現在地の追跡を開始
    navigator.geolocation.watchPosition(updatePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

// function calculateWalkedDistance() {
//     let totalWalkedDistance = 0;

//     for (let i = 0; i < path.getLength() - 1; i++) {
//         const start = path.getAt(i);
//         const end = path.getAt(i + 1);
//         totalWalkedDistance += google.maps.geometry.spherical.computeDistanceBetween(start, end);
//     }

//     console.log(`歩いた距離: ${totalWalkedDistance.toFixed(2)} m`);
//     document.getElementById('walked-distance').innerText = `歩いた距離: ${totalWalkedDistance.toFixed(2)} m`;

//     return totalWalkedDistance; // 計算結果を返す
// }

// calculateWalkedDistance 関数
function calculateWalkedDistance() {
    let totalWalkedDistance = 0;

    console.log('Path length:', path.getLength());
    for (let i = 0; i < path.getLength() - 1; i++) {
        const start = path.getAt(i);
        const end = path.getAt(i + 1);
        const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
        totalWalkedDistance += segmentDistance;
    }

    walkedDistance = totalWalkedDistance; // 合計距離を更新
    console.log(`Total Walked Distance: ${walkedDistance.toFixed(2)} m`);
    document.getElementById('walked-distance').innerText = `歩いた距離: ${(walkedDistance / 1000).toFixed(2)} m`;
}

// 緯度経度のスムージング用フィルタ（直近5点を平均化）
const latFilter = new MovingAverageFilter(5);
const lngFilter = new MovingAverageFilter(5);

// // updatePosition 関数に歩いた距離の更新を追加
// function updatePosition(position) {
//     if (position.coords.accuracy > 20) {
//         console.warn('Accuracy too low:', position.coords.accuracy);
//         return;
//     }

//     currentLocation = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//     };

//     currentLocationMarker.setPosition(currentLocation);
//     path.push(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));

//     // 歩いた距離を更新
//     calculateWalkedDistance();
// }

// updatePosition 関数
function updatePosition(position) {
    if (position.coords.accuracy > 20) {
        console.warn('Accuracy too low:', position.coords.accuracy);
        return;
    }

    const currentTime = Date.now();
    if (lastUpdateTime && currentTime - lastUpdateTime < updateInterval) {
        console.log('Update skipped due to interval threshold');
        return;
    }

    // スムージングされた現在地を計算
    const smoothedLat = latFilter.filter(position.coords.latitude);
    const smoothedLng = lngFilter.filter(position.coords.longitude);
    const newLocation = {
        lat: smoothedLat,
        lng: smoothedLng
    };
    const newLatLng = new google.maps.LatLng(newLocation.lat, newLocation.lng);

    // 初回処理の場合は初期化
    if (!lastLocation) {
        lastLocation = newLatLng;
        lastUpdateTime = currentTime;
        currentLocationMarker.setPosition(newLocation);
        path.push(newLatLng);
        console.log('First position recorded:', newLatLng.toString());
        return;
    }

    // 移動距離と速度を計算
    const distance = google.maps.geometry.spherical.computeDistanceBetween(lastLocation, newLatLng); // メートル
    const timeElapsed = (currentTime - lastUpdateTime) / 1000; // 秒
    const speed = distance / timeElapsed; // m/s

    console.log(`Time elapsed: ${timeElapsed} s, Distance: ${distance.toFixed(2)} m, Speed: ${speed.toFixed(2)} m/s`);

    // 異常な速度や短距離移動の場合は無視
    if (distance < minDistanceThreshold) {
        console.log('Ignored small movement due to distance threshold:', distance);
        return;
    }
    if (speed > maxSpeedThreshold) {
        console.warn(`Unrealistic speed detected: ${speed.toFixed(2)} m/s. Ignoring this update.`);
        alert(`警告: 異常な速度 (${speed.toFixed(2)} m/s) が検出されました。計算をスキップします。`);
        return;
    }

    // 有効な位置情報として処理
    lastLocation = newLatLng;
    lastUpdateTime = currentTime;
    currentLocationMarker.setPosition(newLocation);
    path.push(newLatLng);
    console.log('Updated path:', path.getArray());

    // 距離を更新
    calculateWalkedDistance();
}

function save_distance() {
    const totalWalkedDistance = calculateWalkedDistance(); // 計算結果を取得
    localStorage.setItem("walked_distance", JSON.stringify(totalWalkedDistance));
    alert("保存できたよ");

    // 保存後に変更イベントをトリガー
    window.dispatchEvent(new StorageEvent("storage", {
        key: "walked_distance",
        newValue: JSON.stringify(totalWalkedDistance)
    }));
}
function handleError(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
}

function saveDistanceToServer() {
    const walkedDistance = JSON.parse(localStorage.getItem("walked_distance")) || 0;

    fetch('/api/save_step_data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')  // 必要に応じてCSRFトークンを送信
        },
        body: JSON.stringify({
            steps: walkedDistance  // メートル単位の歩数を送信
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            console.error(data.error);
        }
    })
    .catch(error => console.error('エラー:', error));
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
