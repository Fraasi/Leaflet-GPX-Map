//Le Map
var OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),
	
	OSM_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright/de">OpenStreetMap</a>'}),
	
	landMap = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'}),
	
	cyclemap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'}),
	
	darkmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),
	
	esri = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: '&copy;<a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'});
	
var map = L.map('map', {
	fullscreenControl : {pseudoFullscreen: true},
	center: [61.50, 23.75],
	zoom: 11,
	layers: [OSM_DE],
	contextmenu: true,
	contextmenuWidth: 125, maxZoom: 19,
    contextmenuItems: [{
        text: 'Show coordinates',
        callback: showCoordinates
		}, {
        text: 'Center map here',
        callback: centerMap
		}, '-', {
        text: 'Zoom in',
        icon: 'images/zoom-in.png',
        callback: zoomIn
		}, {
        text: 'Zoom out',
        icon: 'images/zoom-out.png',
        callback: zoomOut
		}, '-', {
		text: 'Upload .GPX file',
		callback: uploadGPX
		}, {
		text: '------Go Home------',
		callback: goHome
		}
	]
});

function showCoordinates(e) {
	prompt(e.latlng, e.latlng);}
function centerMap(e) {
	map.panTo(e.latlng), 11;}
function zoomIn() {
	map.zoomIn(4);}
function zoomOut() {
	map.zoomOut(5);}
function goHome() {
	map.setView([61.5, 23.75], 13);}
function uploadGPX() {
	chosengpx.click();}
				
var baseMaps = {
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
var osmGeocoder = new L.Control.OSMGeocoder({
	collapsed: false,
	position: 'bottomleft',
	text: String.fromCharCode('0x2315'),
	callback: function (results) {
		var bbox = results[0].boundingbox,
			first = new L.LatLng(bbox[0], bbox[2]),
			second = new L.LatLng(bbox[1], bbox[3]),
			bounds = new L.LatLngBounds([first, second]);
		this._map.fitBounds(bounds);

		var place = results[0];

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
L.control.measure({primaryLengthUnit: 'meters',
	secondaryLengthUnit: 'kilometers',
	primaryAreaUnit: 'sqmeters',
	secondaryAreaUnit: 'hectares',
	activeColor: '#345CAE',
	completedColor: '#0526A3',
	position: 'bottomleft'
}).addTo(map);

//Minimap		
var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmMini = new L.TileLayer(osmUrl, {
	minZoom: 0,
	maxZoom: 13,
	attribution: 'Map data &copy; OpenStreetMap contributors'
});

var miniMap = new L.Control.MiniMap(osmMini, {
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

//Elevation box
L.Browser.touch = L.Browser.mobile; // temp fix to get elevation hover working on chrome

var el = L.control.elevation({
	theme: "steelblue-theme",
	width: 300,
	height: 150,
	position: "bottomright",
	collapsed: true
});
el.addTo(map);	

//Toggle Footer-box
var footerButton = document.getElementById('showfooter');
footerButton.addEventListener('click', function(){
	var foot = document.getElementById('footsie');
	var mapHeight = document.getElementById('map');

	if(foot.style.display == 'block'){
		foot.style.display = 'none';
		mapHeight.style.height = '500px';
	} else {
		foot.style.display = 'block';
		mapHeight.style.height = '420px';
	}
});

// Toggle showall button
var tracks = {};
var showAll = document.getElementById("all");
showAll.onclick = function () {
	for (var trackiId in tracks) {
		var gpx = tracks[trackiId];
		if(showAll.innerHTML === 'Show all') {
			map.addLayer(gpx);
		} else {
			map.removeLayer(gpx);
		}
	}
	if (showAll.innerHTML === 'Show all') {
		showAll.innerHTML = 'Hide all';
	} else {
		showAll.innerHTML = 'Show all';
	}
};

var tampere = L.marker([61.4985, 23.764]).bindPopup('This is Tampere.<br>Choose routes in layercontrol on the right. <br>Click route on the map to get info into the hidden footer.<br>Right click to load your own GPX and for some other options.<br>Use all the plugins.').addTo(map);

var layerControl = new L.control.layers(null, null, {collapsed: true}).addTo(map);
layerControl.addOverlay(tampere, "<b>Tampere</b><hr>");

var icons =  {
    startIconUrl: 'images/pin-icon-start.png',
    endIconUrl: 'images/pin-icon-end.png',
    shadowUrl: 'images/pin-shadow.png'
	};

// Few example GPX files, I have about 30 tracks here at the moment...	
var gpxdir = "gpx/";
var gpxfiles =  [
	'2015-08-25T14-25-12_Reuharinniemi.gpx',
	'2015-08-03T12-07-29_Pyhajarvikierros.gpx',
	'2016-07-30T15-18-58_Suolijarvi.gpx'
	];

//The great loopdidoo had to be put into separate functions to get gpxOnClick working for chosen file
function loopdidoo() {
	for (var l = 0; l < gpxfiles.length; l++){
		var urli = gpxdir + gpxfiles[l];
		var gpx = new L.GPX(urli, {
				async: true,
				marker_options: icons
			});
		// console.log(gpx.get_name(), gpx._info.name); // can't get name, oh why?
		//try .on('loaded') next time around
		layerControl.addOverlay(gpx, `${l + 1}. ${urli.slice(24, -4)}`);
		tracks[L.stamp(gpx)] = gpx;
		gpxOnClick(gpx);
	}
}

function gpxOnClick(gpx) {	
	gpx.addEventListener("click", setInfo);	 
};

function setInfo(click, upload){	
	var gpxClicked = upload || click.target;
	map.fitBounds(gpxClicked.getBounds());
	setElevationData(gpxClicked);

	function _id(id) {return document.getElementById(id);}

	// header info 
	_id('title').textContent = gpxClicked.get_name() + " - " + gpxClicked.get_start_time().toDateString() + ', ' + gpxClicked.get_start_time().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
	
	//footer info
	_id('distance').textContent = gpxClicked.get_distance().toFixed(0) / 1000;
	_id('duration').textContent = gpxClicked.get_duration_string(gpxClicked.get_moving_time().toFixed(4));
	_id('avgspeed').textContent = gpxClicked.get_moving_speed().toFixed(0);
	_id('elevation-gain').textContent = gpxClicked.get_elevation_gain().toFixed(0);
	_id('elevation-loss').textContent = gpxClicked.get_elevation_loss().toFixed(0);
	_id('elevation-net').textContent  = gpxClicked.get_elevation_gain().toFixed(0) - gpxClicked.get_elevation_loss().toFixed(0);	
	var stoptimee = gpxClicked.get_total_time() - gpxClicked.get_moving_time();
	// _id('stoptime').textContent = (stoptimee * 1.66667e-5).toFixed();
	_id('stoptime').textContent = (stoptimee / 60000).toFixed();
	_id('fileName').textContent = gpxClicked.fileName || gpxClicked._gpx.slice(4);
}

function setElevationData(gpx){
	el.clear();
	for (var gpxLayer in gpx._layers){
		for (var trackLayer in gpx._layers[gpxLayer]._layers){
			el.addData(gpx._layers[gpxLayer]._layers[trackLayer]);
		}
	}	
};

//Choose files
var chosengpx = document.getElementById("choosegpx");
 	      
function chosenFile(){
	var gpx = false;

    if ('files' in chosengpx) {
		var file = chosengpx.files[0];

		var objectURL = window.URL.createObjectURL(file);
		var gpx = new L.GPX(objectURL, {
				async: true,
				marker_options: icons
			})
			.on('loaded', function(e) {
				var gpx = e.target;
				layerControl.addOverlay(gpx, `${Object.keys(tracks).length + 1}. ${gpx._info.name || file.name}`);
				tracks[L.stamp(gpx)] = gpx;
				tracks[L.stamp(gpx)].fileName = file.name;
				gpxOnClick(gpx);
				setInfo(null, gpx);
				window.URL.revokeObjectURL(file);
			}).addTo(map);
	}
}

loopdidoo();