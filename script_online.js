// Initialize map
var map = L.map('map').setView([61.15, -149.7], 9);



// Define  individual tile layers
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxzoom: 18,
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
});

var labelLayer = L.tileLayer('https://stadiamaps.com{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap'
});

var googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    attribution: '© Google'
});

var googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data &copy; Google'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: © OpenStreetMap, SRTM | Map style: © OpenTopoMap'
});

var usgsTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Tiles courtesy of the <a href="https://www.usgs.gov/">U.S. Geological Survey</a>'
});

// Add default layer to the map
osm.addTo(map);

// Basemap control panel
var baseMaps = {
    "OpenStreetMap": osm,
    "Esri Satellite Imagery": esriSat,
    "Esri Hybrid Imagery": L.layerGroup([esriSat, labelLayer]),
    "Google Satellite Imagery": googleSat,
    "Google Hybrid Imagery": googleHybrid,
    "USGS Topographic Map": usgsTopo,
    "OpenTopoMap": topo
};

// Add control panel to map
var layerControl = L.control.layers(baseMaps).addTo(map);
// L.control.layers(baseMaps).addTo(map);

// Load GeoJSON dynamically
fetch("https://raw.githubusercontent.com/springermoore/fuelbreaks-webmap/refs/heads/main/points.geojson")
  .then(response => response.json())
  .then(data => {
    const markerColors = {
      "Basher 1": "#2ff381",
      "Basher 2": "#00692c",
      "Basher 3": "#249754",
      "Basher 4": "#7cfb98",

      "Hiland Upper": "#68bdf5",
      "Hiland Lower": "#2182c3",

      "Gasline 1": "#d86609",
      "Gasline 2": "#fda000",

      "Heights Hill": "#ff00c8",
      "Hilltop": "#ff2108",
      "Prospect Heights": "#720303",
      "Sahalee": "#c82d06",
    
      "Grandview": "#7300ff",
      "Moose River": "#ac05c2",
      "Three Johns North": "#6e1893",
      "Three Johns Center": "#9746e8",
      "Three Johns South": "#821cc1",
      "USFWS Preset": "#3e2c73"};

      
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const area = feature.properties.name;
        const color = markerColors[area] || "#000000"; // fallback black

        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: color,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9});
      },

      onEachFeature: function (feature, layer) {

        layer.on('click', function () {

          // Unique container ID for each popup
          var containerId = "pano_" + Date.now();

          const collectionDate = feature.properties.col_date;

          var popupContent = `
            <div style="font-size:14px; margin-bottom:6px;">
                <b>Date Collected:</b> ${collectionDate}
            </div>

            <div class="pano-container" id="${containerId}"></div>
          `;

          layer.bindPopup(popupContent, { maxWidth: 450 }).openPopup();

          // Delay to ensure popup is rendered
          setTimeout(function () {
            pannellum.viewer(containerId, {
              type: "equirectangular",
              panorama: feature.properties.image_url,
              autoLoad: true,
              showZoomCtrl: true
            });
          }, 200);
        });
      }
    }).addTo(map);
    
  });

// Load line layer with attached 360° videos
fetch("https://raw.githubusercontent.com/springermoore/fuelbreaks-webmap/refs/heads/main/lines.geojson")
  .then(response => response.json())
  .then(lines => {

    var lineLayer = L.geoJSON(lines, {
      style: function(feature) {
        return {
          color: "#ff6600",
          weight: 4,
          opacity: 0.9
        };
      },

      onEachFeature: function(feature, layer) {

          layer.on("click", function() {

              const youtubeId = feature.properties.youtube;
              const collectionDate = feature.properties.col_date;

              layer.bindPopup(
                  `
                  <div style="width:800px;">
                      <div style="margin-bottom:8px; font-size:14px;">
                          <b>Date Collected:</b> ${collectionDate}
                      </div>

                      <iframe
                          width="800"
                          height="450"
                          src="https://www.youtube.com/embed/${youtubeId}?playsinline=1&rel=0"
                          title="360° Video"
                          frameborder="0"
                          referrerpolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowfullscreen>
                      </iframe>
                  </div>
                  `,
                  {
                      maxWidth: 1400
                  }
              ).openPopup();

          });

      }
    });

    lineLayer.addTo(map);
    layerControl.addOverlay(lineLayer, "360° Video Lines");
  });


var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    var areas = {
      "Basher 1": "#2ff381",
      "Basher 2": "#00692c",
      "Basher 3": "#249754",
      "Basher 4": "#7cfb98",

      "Hiland Upper": "#68bdf5",
      "Hiland Lower": "#2182c3",

      "Gasline 1": "#d86609",
      "Gasline 2": "#fda000",

      "Heights Hill": "#ff00c8",
      "Hilltop": "#ff2108",
      "Prospect Heights": "#720303",
      "Sahalee": "#c82d06",
    
      "Grandview": "#7300ff",
      "Moose River": "#ac05c2",
      "Three Johns North": "#470165",
      "Three Johns Center": "#9746e8",
      "Three Johns South": "#6f259c",
      "USFWS Preset": "#3e2c73"};


    div.innerHTML += "<b>Fuelbreak Legend</b><br>";

    for (var area in areas) {
        div.innerHTML +=
            '<i style="background:' + areas[area] + '"></i> ' +
            area + "<br>";
    }

    return div;
  };

legend.addTo(map);

var title = L.control({ position: "topleft" });

title.onAdd = function (map) {
    var div = L.DomUtil.create("div", "map-title");
    div.innerHTML = `
        360° Tour of Anchorage-Area Fuelbreaks
        <div class="map-subtitle">Imagery taken by Springer Moore</div>
    `;
    return div;
};

title.addTo(map);