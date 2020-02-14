L.Control.Sidebar = L.Control.extend({
	options: {
		position: 'topleft',
		openOnAdd: false,
		showHeader: false,
		showFooter: false,
		fullHeight: false,
		togglePan: false,
		autoResize: false,
		headerHeight: 10,
		footerHeight: 10
	},
	initialize: function(sidebarID, options)
	{
		// Sets options of leaflet object
		L.setOptions(this, options);

		// Returns element from HTML based on its ID
		var sidebar = L.DomUtil.get(sidebarID);

		// Gets the "side" of the map the sidebar is on
		this._side = (this.options.position === 'topright' || this.options.position === 'bottomright') ? 'right' : 'left';
		this._id = (this.options.position === 'topright' || this.options.position === 'bottomright') ? "sidebar-right" : "sidebar-left";

		// Determines the height of the sidebar elements based on options passed by user
		var viewheight = document.documentElement.scrollHeight * 0.01;
		this._sidebarHeight = (this.options.fullHeight) ? 100 : 97;
		this._sidebarWidth = (window.innerWidth <= 500) ? ((window.innerWidth * 0.95) - 31.5) : 370;
		this._headerHeight = (this.options.showHeader ? this.options.headerHeight : 0) * viewheight;
		this._footerHeight = (this.options.showFooter ? this.options.footerHeight : 0) * viewheight;
		this._bodyHeight = (this._sidebarHeight * viewheight) - this._headerHeight - this._footerHeight;

		// Extracts the different layers for this sidebar
		this._layers = [];
		this._parents = [];
		for(var i = 0; i < sidebar.children.length; i++)
		{
			var newLayer = L.DomUtil.create('div', 'sidebar-layer');
			var layerParent = -1;

			// Adds in the footer node
			newLayer.appendChild(sidebar.children[i].children[0]);

			// Creates body div to fill in
			var bodyDiv = L.DomUtil.create('div', 'sidebar-body sidebar-transition');

			// Adds in "back" button if the layer has a parent set
			if(sidebar.children[i].getAttribute("parent"))
			{
				// Parses parent attribute and creates back button container div
				layerParent = parseInt(sidebar.children[i].getAttribute("parent"));

				// Creates actual button with the back function
				var backButton = L.DomUtil.create('button', 'back-button');
				backButton.innerHTML = "Back";

				// Assigns binded function to back button
				L.DomEvent.on(backButton, 'click', function() {
					this.showParent();
				}, this);

				// Inserts back button into body div
				var backDiv = L.DomUtil.create('div', 'sidebar-back');
				backDiv.appendChild(backButton);
				bodyDiv.appendChild(backDiv);
			}

			// Adds in the body node
			bodyDiv.appendChild(sidebar.children[i].children[0]);
			newLayer.appendChild(bodyDiv);

			// Adds in the footer node
			newLayer.appendChild(sidebar.children[i].children[0]);

			// Assigns classes to header, body, and footer nodes
			L.DomUtil.addClass(newLayer.children[0], this._side + '-header');
			L.DomUtil.addClass(newLayer.children[1], this._side + '-body');
			L.DomUtil.addClass(newLayer.children[2], this._side + '-footer');

			// Modifies height of the elements based on options
			newLayer.children[0].style.height = this._headerHeight.toString() + 'px';
			newLayer.children[1].style.height = this._bodyHeight.toString() + 'px';
			newLayer.children[2].style.height = this._footerHeight.toString() + 'px';

			this._layers.push(newLayer);

			this._parents.push(layerParent);
		}
	},
	onAdd: function(map)
	{
		this._hasAttribution = (map.attributionControl) ? true : false;

		this._map = map;

		// Allows the user to specify if the sidebar is open when added to map
		this._isVisible = this.options.openOnAdd;

		// Creates the container for the sidebar and the button
		this._container = L.DomUtil.create('div', 'leaflet-sidebar sidebar-transition');
		this._container.id = this._id;

		// Automatically sets the height of the sidebar based on the inner height of the browser
		var viewheight = document.documentElement.scrollHeight * 0.01;
		this._container.style.height = (this._sidebarHeight * viewheight).toString() + 'px';

		if(this.options.autoResize)
		{
			window.addEventListener('resize', function() {
				this.repaint();
			}.bind(this));
		}

		// Disables margins if the user has specified full height
		if(this.options.fullHeight)
		{
			this._container.style.marginTop = '0px';
			this._container.style.marginRight = '-2px';
			this._container.style.marginLeft = '-2px';
		}

		// Ensures the toggle button will go to the end of the page
		if(this._side === 'right')
		{
			this._container.style.justifyContent = 'flex-end';
		}

		// Creates the div for the sidebar
		this._content = L.DomUtil.create('div', 'sidebar-layer sidebar-transition');
		this._content.id = this._side + "-layer";

		this._content.style.visibility = (this._isVisible) ? "visible" : "hidden";

		// Adds classes to sidebar for transition animation
		L.DomUtil.addClass(this._container, 'sidebar-collapse');

		// Shows sidebar and pans map based on user options
		var sideOffset = (this._isVisible) ? "0px" : ("-" + this._sidebarWidth.toString() + "px");

		if(this._side === 'right')
		{
			this._container.style.right = sideOffset;
		}
		else
		{
			this._container.style.left = sideOffset;
		}

		if(this._isVisible && this.options.togglePan)
		{
			this._map.panBy([-190, 0], {duration: 0, animate: false});
		}

		// Adds class for CSS so the attribution
		if(this._hasAttribution && this._side === 'right')
		{
			var attrClass = (this._isVisible) ? 'leaflet-control-attribution-right' : 'leaflet-control-attribution-right-closed';
			document.getElementsByClassName('leaflet-control-attribution')[0].classList.add(attrClass);
		}

		// Extracts nodes from first layer to place into sidebar
		this._currentIndex = 0;
		while(this._layers[0].firstChild)
		{
			this._content.appendChild(this._layers[0].firstChild);
		}

		// Creates the div for the button to toggle the sidebar
		this._closeDiv = L.DomUtil.create('div', 'sidebar-close');
		L.DomUtil.addClass(this._closeDiv, this._side + '-close');

		// Creates the actual button to toggle the sidebar
		this._closeButton = L.DomUtil.create('button', 'close-button');
		this._closeButton.innerHTML = (!(this._side === 'left' ^ this._isVisible)) ? /* < */ '&#9668;' : '&#9658;' /* > */;
		L.DomEvent.on(this._closeButton, 'click', function() {
			this.toggle();
		}, this);
		this._closeDiv.appendChild(this._closeButton);

		// Changes order of additions based on side (so they display correctly)
		if(this._side === 'right')
		{
			this._closeButton.style.paddingLeft = "8px";
			this._closeButton.style.paddingRight = "4px";
			this._container.appendChild(this._closeDiv);
			this._container.appendChild(this._content);
		}
		else
		{
			this._container.appendChild(this._content);
			this._container.appendChild(this._closeDiv);
		}

		// Disables click and scroll propagation, i.e. allow user to click and scroll on sidebar without affecting map
		L.DomEvent.disableScrollPropagation(this._content);
		L.DomEvent.disableScrollPropagation(this._closeButton);
		L.DomEvent.disableClickPropagation(this._content);
		L.DomEvent.disableClickPropagation(this._closeButton);

		return this._container;
	},
	open: function()
	{
		// If the sidebar is not currently marked as visible, open up
		if(!this._isVisible)
		{
			this.fire('open');

			this._isVisible = true;

			this._closeButton.innerHTML = (this._side === 'right') ? /* > */ '&#9658;' : '&#9668;' /* < */;

			if(this._side === 'right')
			{
				this._container.style.right = 0;
			}
			else
			{
				this._container.style.left = 0;
			}

			this._content.style.visibility = "visible";

			if(this._hasAttribution && this._side === 'right')
			{
				L.DomUtil.removeClass(document.getElementsByClassName('leaflet-control-attribution')[0], 'leaflet-control-attribution-right-closed');
			}

			if(this.options.togglePan)
			{
				this._map.panBy([-this._content.offsetWidth / 2.0, 0], {duration: 0.5, easeLinearity: 0.6});
			}
		}
	},
	close: function()
	{
		// If the sidebar is currently marked as visible, close it
		if(this._isVisible)
		{
			this.fire('close');

			this._isVisible = false;

			this._closeButton.innerHTML = (this._side === 'right') ? /* < */ '&#9668;' : '&#9658;' /* > */;

			if(this._side === 'right')
			{
				this._container.style.right = "-" + (this._content.offsetWidth - 4) + "px";
			}
			else
			{
				this._container.style.left = "-" + (this._content.offsetWidth - 4) + "px";
			}

			this._content.style.visibility = "hidden";

			if(this._hasAttribution && this._side === 'right')
			{
				L.DomUtil.addClass(document.getElementsByClassName('leaflet-control-attribution')[0], 'leaflet-control-attribution-right-closed');
			}

			if(this.options.togglePan)
			{
				this._map.panBy([this._content.offsetWidth / 2.0, 0], {duration: 0.5, easeLinearity: 0.6});
			}
		}
	},
	repaint: function()
	{
		var viewheight = document.documentElement.scrollHeight * 0.01;
		this._container.style.height = (this._sidebarHeight * viewheight).toString() + 'px';
		this._bodyHeight = (this._sidebarHeight * viewheight) - this._headerHeight - this._footerHeight - 2;

		this._content.children[1].style.height = this._bodyHeight.toString() + 'px';

		for(var i = 0; i < this._layers.length; i++)
		{
			if(i !== this._currentIndex)
			{
				this._layers[i].children[1].style.height = this._bodyHeight.toString() + 'px';
			}
		}

		if(!this._isVisible)
		{
			this._sidebarWidth = (window.innerWidth <= 500) ? ((window.innerWidth * 0.95) - 31.5) : 370;

			if(this._side === 'right')
			{
				this._container.style.right = "-" + this._sidebarWidth.toString() + "px";
			}
			else
			{
				this._container.style.left = "-" + this._sidebarWidth.toString() + "px";
			}
		}
	},
	showParent: function()
	{
		if(this._parents[this._currentIndex] !== -1)
		{
			this.showLayer(this._parents[this._currentIndex]);
		}
	},
	showLayer: function(index)
	{
		// Ensures that the index passed is not out of bounds
		if(index > this._layers.length)
		{
			return;
		}

		this.fire('switchlayer');

		// Removes all content from the sidebar (and removes any nodes)
		while(this._content.firstChild)
		{
			this._layers[this._currentIndex].appendChild(this._content.children[0]);
		}

		// Sets the sidebar content to the requested layer
		while(this._layers[index].firstChild)
		{
			this._content.appendChild(this._layers[index].firstChild);
		}
		this._currentIndex = index;

		this.repaint();
	},
	toggle: function()
	{
		// If the sidebar is currently marked as visible, close it. Otherwise, open it.
		if(this._isVisible)
		{
			this.close();
		}
		else
		{
			this.open();
		}
	},
	onRemove: function()
	{
		this._side = null;
		this._id = null;
		this._isVisible = null;

		for(var i = 0; i < this._layers.length; i++)
		{
			while(this._layers[i].firstChild)
			{
				this._layers[i].removeChild(this._layers[i].firstChild);
			}
		}
		this._layers = null;

		while(this._content.firstChild)
		{
			this._content.removeChild(this._content.firstChild);
		}

		L.DomEvent.off(this._closeButton, 'click', function() {
			this.toggle();
		}, this);
		this._closeDiv.removeChild(this._closeDiv.firstChild);

		while(this._container.firstChild)
		{
			this._container.removeChild(this._container.firstChild);
		}

		this._content = null;
		this._closeButton = null;
		this._closeDiv = null;
		this._container = null;
	},
	isOpen: function()
	{
		return this._isVisible;
	},
	getContainer: function()
	{
		return this._container;
	},
	getContent: function()
	{
		return this._content;
	},
	getCurrentIndex: function()
	{
		return this._currentIndex;
	},
	getCloseButton: function()
	{
		return this._closeButton;
	}
});

L.extend(L.Control.Sidebar.prototype, L.Evented.prototype);

L.control.sidebar = function(sidebarID, options) {
	return new L.Control.Sidebar(sidebarID, options);
};
