//Le Maps
const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}),

	OSM_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright/de">OpenStreetMap</a>'
	}),

	landMap = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'
	}),

	cyclemap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'
	}),

	darkmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}),

	esri = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: '&copy;<a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
	});

const chooseGpxEl = document.getElementById("choosegpx");
chooseGpxEl.addEventListener('change', chosenFile)

const map = L.map('map', {
	fullscreenControl: { pseudoFullscreen: true },
	center: [61.50, 23.75],
	zoom: 11,
	layers: [OSM_DE],
	contextmenu: true,
	contextmenuWidth: 150, maxZoom: 19,
	contextmenuItems: [{
		text: 'Show coordinates',
		callback: (e) => { prompt(e.latlng, `${e.latlng.lat}, ${e.latlng.lng}`); }
	}, {
		text: 'Center map here',
		callback: () => { map.panTo(e.latlng), 11; }
	}, '-', {
		text: 'Zoom in',
		icon: 'images/zoom-in.png',
		callback: () => { map.zoomIn(4); }
	}, {
		text: 'Zoom out',
		icon: 'images/zoom-out.png',
		callback: () => { map.zoomOut(5); }
	}, '-', {
		text: 'Upload .GPX file',
		callback: () => { chooseGpxEl.click(); }
	}, {
		text: '------Go Home------',
		callback: () => { map.setView([61.5, 23.75], 13); }
	}
	]
});

const baseMaps = {
	"OSM": OSM,
	"OSM_DE": OSM_DE,
	"Landscape": landMap,
	"Cyclemap": cyclemap,
	"Darkmap": darkmap,
	"Esri (satellite)": esri
};
L.control.layers(baseMaps).addTo(map);

//PLUGINS
//Geocoder
const osmGeocoder = new L.Control.OSMGeocoder({
	collapsed: false,
	position: 'bottomleft',
	text: String.fromCharCode('0x2315'),
	callback: function (results) {
		const bbox = results[0].boundingbox,
			first = new L.LatLng(bbox[0], bbox[2]),
			second = new L.LatLng(bbox[1], bbox[3]),
			bounds = new L.LatLngBounds([first, second]);
		this._map.fitBounds(bounds);

		const place = results[0];

		L.marker([place.lat, place.lon], { title: place.display_name.split(',')[0] })
			.bindPopup(
				`<div style="text-align:center;">
				${place.type.replace(place.type.charAt(0), place.type.charAt(0).toUpperCase())}, ${place.class} <br><br>
				${place.display_name} <br><br>
				${results[0].lat + ', ' + results[0].lon}
			</div>`
			).addTo(map);
	}
});
map.addControl(osmGeocoder);

//MeasureDistance
L.control.measure({
	primaryLengthUnit: 'meters',
	secondaryLengthUnit: 'kilometers',
	primaryAreaUnit: 'sqmeters',
	secondaryAreaUnit: 'hectares',
	activeColor: '#345CAE',
	completedColor: '#0526A3',
	position: 'bottomleft'
}).addTo(map);

//Minimap
const osmMini = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 0,
	maxZoom: 13,
	attribution: 'Map data &copy; OpenStreetMap contributors'
});

const miniMap = new L.Control.MiniMap(osmMini, {
	minimized: true,
	toggleDisplay: true,
	position: 'bottomleft',
	zoomLevelOffset: -6
}).addTo(map);

//Scale
L.control.scale({
	position: 'bottomright',
	imperial: false,
	maxWidth: 150
}).addTo(map);

const elevation = L.control.elevation({
	theme: "steelblue-theme",
	width: 300,
	height: 150,
	position: "bottomright",
	collapsed: true
});
elevation.addTo(map);

// sidebar
const sidebar = L.control.sidebar('sidebar', {
	showHeader: true,
	togglePan: true,
	position: 'topleft'
})
sidebar.addTo(map);


// easybutton
// L.easyButton('<span class="star">&starf;</span>', function () {
// 	sidebar.toggle()
// },
// 	'Toggle track info',
// 	{ position: 'bottomright' }
// ).addTo(map);

// Toggle showall button
const tracks = {};
const showAllButton = document.getElementById("show-all");
showAllButton.addEventListener('click', function () {
	console.log(tracks)
	for (let trackId in tracks) {
		const gpx = tracks[trackId];
		if (this.textContent === 'Show all') {
			map.addLayer(gpx);
		} else {
			map.removeLayer(gpx);
		}
	}
	if (this.textContent === 'Show all') {
		this.textContent = 'Hide all';
	} else {
		this.textContent = 'Show all';
	}
});

const tampere = L.marker([61.4985, 23.764]).bindPopup('This is Tampere.<br>Choose routes in layer control on the right. <br>Click route on the map to get info into the hidden footer.<br>Right click to load your own GPX and for some other options.<br>Use all the plugins.').addTo(map);

const layerControl = new L.control.layers(null, null, { collapsed: true }).addTo(map);
layerControl.addOverlay(tampere, "<b>Tampere</b><hr>");

const icons = {
	startIconUrl: 'images/pin-icon-start.png',
	endIconUrl: 'images/pin-icon-end.png',
	shadowUrl: 'images/pin-shadow.png'
};

// Few example GPX files, I have about 30 tracks here at the moment...
const gpxdir = "gpx/";
const gpxfiles = [
	'2015-08-25T14-25-12_Reuharinniemi.gpx',
	'2015-08-03T12-07-29_Pyhajarvikierros.gpx',
	'2016-07-30T15-18-58_Suolijarvi.gpx'
];

//The great loopdidoo had to be put into separate functions to get gpxOnClick working for chosen file
function loopdidoo() {
	for (let l = 0; l < gpxfiles.length; l++) {
		const urli = gpxdir + gpxfiles[l];
		const gpx = new L.GPX(urli, {
			async: true,
			marker_options: icons
		});
		// console.log(gpx)
		// console.log(gpx.get_name(), gpx._info.name); // can't get name, oh why?
		//try .on('loaded') next time around
		layerControl.addOverlay(gpx, `${l + 1}. ${urli.slice(24, -4)}`);
		tracks[L.stamp(gpx)] = gpx;
		gpxOnClick(gpx);
	}
}

function gpxOnClick(gpx) {
	gpx.addEventListener("click", setTrackInfo);
};

function setTrackInfo(click, upload) {
	const gpxClicked = upload || click.target;
	map.fitBounds(gpxClicked.getBounds());
	setElevationData(gpxClicked);

	function _id(id) { return document.getElementById(id); }

	_id('track-title').textContent = gpxClicked.get_name();
	_id('track-date').textContent = gpxClicked.get_start_time().toDateString() + ', ' + gpxClicked.get_start_time().toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });

	_id('distance').textContent = gpxClicked.get_distance().toFixed(0) / 1000;
	_id('duration').textContent = gpxClicked.get_duration_string(gpxClicked.get_moving_time().toFixed(4));
	_id('avgspeed').textContent = gpxClicked.get_moving_speed().toFixed(0);
	_id('elevation-gain').textContent = gpxClicked.get_elevation_gain().toFixed(0);
	_id('elevation-loss').textContent = gpxClicked.get_elevation_loss().toFixed(0);
	_id('elevation-net').textContent = gpxClicked.get_elevation_gain().toFixed(0) - gpxClicked.get_elevation_loss().toFixed(0);
	var stoptimee = gpxClicked.get_total_time() - gpxClicked.get_moving_time();
	// _id('stoptime').textContent = (stoptimee * 1.66667e-5).toFixed();
	_id('stoptime').textContent = (stoptimee / 60000).toFixed();
	_id('fileName').textContent = gpxClicked.fileName || gpxClicked._gpx.slice(4);
}

function setElevationData(gpx) {
	elevation.clear();
	for (let gpxLayer in gpx._layers) {
		for (let trackLayer in gpx._layers[gpxLayer]._layers) {
			elevation.addData(gpx._layers[gpxLayer]._layers[trackLayer]);
		}
	}
};

//Choose files

function chosenFile() {
	// var gpx = false;

	if ('files' in chooseGpxEl) {
		const file = chooseGpxEl.files[0];

		const objectURL = window.URL.createObjectURL(file);
		new L.GPX(objectURL, {
			async: true,
			marker_options: icons
		})
			.on('loaded', function (e) {
				const gpx = e.target;
				layerControl.addOverlay(gpx, `${Object.keys(tracks).length + 1}. ${gpx._info.name || file.name}`);
				tracks[L.stamp(gpx)] = gpx;
				tracks[L.stamp(gpx)].fileName = file.name;
				gpxOnClick(gpx);
				setTrackInfo(null, gpx);
				window.URL.revokeObjectURL(file);
			}).addTo(map);
	}
}

loopdidoo();
