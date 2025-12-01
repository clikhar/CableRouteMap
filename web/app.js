let map = L.map('map').setView([21.1458, 79.0882], 12); // Default Nagpur

// Free OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let routeLine;
let markers = [];
let selectedMarker = null;
let cableCoords = [];

// Draw route from textarea
function drawRoute() {
    const text = document.getElementById("coordsInput").value;
    const lines = text.split("\n");

    cableCoords = [];

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    lines.forEach(line => {
        const [lat, lng] = line.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            let pos = [lat, lng];
            cableCoords.push(pos);

            const marker = L.marker(pos, { draggable: true }).addTo(map);
            marker.on('click', () => selectedMarker = marker);
            marker.on('dragend', updateCoordsFromMarkers);

            markers.push(marker);
        }
    });

    if (routeLine) map.removeLayer(routeLine);

    routeLine = L.polyline(cableCoords, { color: 'red', weight: 4 }).addTo(map);

    if (cableCoords.length > 0) {
        map.setView(cableCoords[0], 14);
    }
}

// Update textarea when dragging marker
function updateCoordsFromMarkers() {
    let text = "";
    markers.forEach(m => {
        const p = m.getLatLng();
        text += `${p.lat},${p.lng}\n`;
    });
    document.getElementById("coordsInput").value = text;
    drawRoute();
}

// Save to browser
function saveRoute() {
    localStorage.setItem("cableRoute", JSON.stringify(cableCoords));
    alert("Route saved!");
}

// Load saved on start
(function loadSavedRoute() {
    const data = localStorage.getItem("cableRoute");
    if (data) {
        cableCoords = JSON.parse(data);
        let text = "";
        cableCoords.forEach(c => text += `${c[0]},${c[1]}\n`);
        document.getElementById("coordsInput").value = text;
        drawRoute();
    }
})();

// Add photo to clicked marker
function addPhoto() {
    if (!selectedMarker) {
        alert("Click a point on the map first.");
        return;
    }

    const fileInput = document.getElementById("photoUpload");
    if (!fileInput.files[0]) {
        alert("Select a photo first.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgSrc = e.target.result;

        const popupContent = `<img src="${imgSrc}" width="150" />`;

        selectedMarker.bindPopup(popupContent).openPopup();
    };

    reader.readAsDataURL(fileInput.files[0]);
}
