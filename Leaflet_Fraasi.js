//Le Map
	var OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),
	
	landMap = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'}),
	
	cyclemap = L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>'}),
	
	darkmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
	
var map = L.map('map', {
	fullscreenControl : {pseudoFullscreen: true},
	center: [61.50, 23.75],
	zoom: 11,
	layers: [OSM],
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
		text: '------Go Home------',
		callback: setView
	}
	]});
			function showCoordinates (e) {
				prompt(e.latlng, e.latlng);}
			function centerMap (e) {
				map.panTo(e.latlng), 11;}
			function zoomIn (e) {
				map.zoomIn(4);}
			function zoomOut (e) {
				map.zoomOut(5);}
			function setView (e) {
				map.setView([61.5, 23.75], 13);}

var baseMaps = {
	"OSM": OSM,
	"Landscape": landMap,
	"Cyclemap": cyclemap,
	"Darkmap": darkmap
};
	
L.control.layers(baseMaps).addTo(map);

//PLUGINS
//Geocoder
var osmGeocoder = new L.Control.OSMGeocoder({
		collapsed: false,
		position: 'bottomleft',
		text: 'Haje!',
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
var osmAttrib='Map data &copy; OpenStreetMap contributors';
var osm2 = new L.TileLayer(osmUrl, {
		minZoom: 0,
		maxZoom: 13,
		attribution: osmAttrib
	});
var miniMap = new L.Control.MiniMap(osm2, {
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
var el = L.control.elevation({
	theme: "steelblue-theme",
	width: 300,
	height: 150,
	position: "bottomright",
	collapsed: true
});
el.addTo(map);	

// Toggle Choose-box
var cbutton = document.getElementById('showHide');

cbutton.addEventListener('click', function(){
	var cbox = document.getElementById('choosebox');
	var mapWidth = document.getElementById('map');
	var header = document.getElementById('hedder');
	
	if(cbox.style.display == 'block'){
		cbox.style.display = 'none';
		cbutton.innerHTML = '&larr;';
		mapWidth.style.width = '98%';
		header.style.width = '97.7%'; 
	} else {
		cbox.style.display = 'block';
		cbutton.innerHTML = '&rarr;';
		mapWidth.style.width = '75%';
		header.style.width = '75%';
	}
});

//Toggle Footer-box
var fbutton = document.getElementById('showfooter');
fbutton.addEventListener('click', function(){
	var foot = document.getElementById('footsie');
	var mapHeight = document.getElementById('map');

	if(foot.style.display == 'block'){
		foot.style.display = 'none';
		fbutton.innerHTML = '&uarr;';
		mapHeight.style.height = '500px';
	} else {
		foot.style.display = 'block';
		fbutton.innerHTML = '&darr;';
		mapHeight.style.height = '420px';
	}
});

// Toggle showall button
var tracks = {};
var showAll = document.getElementById("all");
showAll.onclick = function () {
	for (var reittiId in tracks) {
		var gpx = tracks[reittiId];
		if(showAll.innerHTML === 'Show all') {
			map.addLayer(gpx);
		} else {
			map.removeLayer(gpx);
		}
	}	
	if (showAll.innerHTML === 'Show all'){
		showAll.innerHTML = 'Hide all';
	} else {
		showAll.innerHTML = 'Show all';
	}
};

var tampere = L.marker([61.4985, 23.764]).bindPopup('This is Tampere.<br>Choose routes in layercontrol on the right. <br>Click route on the map to get info into the hidden footer.<br>Use all the plugins.<br>Also right click for some extra options.<br>Profit!').addTo(map);

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
	'2016-07-30T15-18-58_Suolijärvi.gpx'
	];

//The great loopdidoo had to be put into function to get gpxOnClick working for chosen file
function loopdidoo() {
	for (var l = 0; l < gpxfiles.length; l++){
		var urli = gpxdir + gpxfiles[l];
		var gpx = new L.GPX(urli, {
				async: true,
				marker_options: icons
			});
		var n = l + 1;	

		layerControl.addOverlay(gpx, "" + n++ + ". " + urli.slice(24, -4));
		tracks[L.stamp(gpx)] = gpx;
		gpxOnClick(gpx);
	}
}

function gpxOnClick(gpx) {	
	gpx.addEventListener("click", function(event){	
		var gpxClicked = event.target;
		map.fitBounds(gpxClicked.getBounds());
		setElevationData(gpxClicked);

		function _id(id) {return document.getElementById(id);}
	
		// header info 
		_id('title').textContent = gpxClicked.get_name() + " - " + gpxClicked.get_start_time().toDateString() + ', ' + gpxClicked.get_start_time().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
		
		//footer info
		_id('distance').textContent = gpxClicked.get_distance().toFixed(0) / 1000;
		_id('duration').textContent = gpxClicked.get_duration_string(gpxClicked.get_moving_time().toFixed(4));
		_id('avgspeed').textContent = gpxClicked.get_moving_speed().toFixed(0);
	   	_id('elevation-gain').textContent = gpxClicked.get_elevation_gain().toFixed(0);
		_id('elevation-loss').textContent = gpxClicked.get_elevation_loss().toFixed(0);
		_id('elevation-net').textContent  = gpxClicked.get_elevation_gain().toFixed(0) - gpxClicked.get_elevation_loss().toFixed(0);	
		var stoptimee = gpxClicked.get_total_time() - gpxClicked.get_moving_time();
		_id('stoptime').textContent = (stoptimee * 1.66667e-5).toFixed();
	});	 
};

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
	var txt = "";

    if ('files' in chosengpx) {
		for (var i = 0; i < chosengpx.files.length; i++) {
			txt += "<br><strong>" + (i+1) + ". file</strong><br>";
			var file = chosengpx.files[i];
			
			if ('name' in file) {
				txt += "<strong>name: </strong>" + file.name + "<br>";
			}
			if ('size' in file) {
				txt += "<b>  size: </b>" + Math.round((file.size / 1024)) + " kb <br>";
			}

			var objectURL = window.URL.createObjectURL(file);
			var gpx = new L.GPX(objectURL, {
					async: true,
					marker_options: icons
				}).on('loaded', function(e) {
					var gpx = e.target;
					layerControl.addOverlay(gpx, "" + file.name);
					tracks[L.stamp(gpx)] = gpx;
					gpxOnClick(gpx);
					map.fitBounds(gpx.getBounds());
					window.URL.revokeObjectURL(file);
				}).addTo(map);
		}
	}
	document.getElementById("nimi").innerHTML = txt;
	document.getElementById("title").innerHTML = "<b>" + file.name +"</b>";	
}
loopdidoo();