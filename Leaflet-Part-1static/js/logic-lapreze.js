// Initialize the map
var myMap = L.map('map', {
    center: [37.5, -119.5], // Centers map on California
    zoom: 5
});

// Add a base layer (tile layer) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define the URL for your GeoJSON data
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Fetch and add GeoJSON data to the map
d3.json(url).then((data) => {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCustomMarker
    }).addTo(myMap);
    addLegend(); // Call the function to add the legend after creating the features
}

// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
}

// Function to create a customized marker for each earthquake feature
function createCustomMarker(feature, latlng) {
    
    // Create the marker
    var marker = L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    });

    // Bind a tooltip to the marker
    marker.bindTooltip(
        `<b>Magnitude:</b> ${feature.properties.mag}<br>
         <b>Location:</b> ${feature.properties.place}<br>
         <b>Depth:</b> ${feature.geometry.coordinates[2]} km`,
        {permanent: false, direction: 'auto'}
    );

    return marker;
}

// Function to determine marker size based on earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 4;  // Adjust multiplier as necessary for visibility
}

// Function to determine color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' : // Red for the deepest
           depth > 70 ? '#FF4500' : // Orange Red
           depth > 50 ? '#FF8C00' : // Dark Orange
           depth > 30 ? '#FFD700' : // Light Yellow
           depth > 10 ? '#B5E61D' : // Light Olive
                        '#39FF14' ; // Green for the shallowest
}

// Function to add a legend to the map
function addLegend() {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            depths = [0, 10, 30, 50, 70, 90],
            labels = [],
            from, to;

        // Add title
        div.innerHTML += '<h4 style="margin-top: 0; margin-bottom: 10px;">Earthquake Depth Legend</h4>';

        // Loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depths.length; i++) {
            from = depths[i];
            to = depths[i + 1];

            labels.push(
                '<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to + ' km' : '+ km'));
        }

        div.innerHTML += labels.join('<br>');
        return div;
    };

    legend.addTo(myMap);
}