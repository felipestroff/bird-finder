// Required utility and control imports
import URLUtils from './utils/urlUtils.js';
import MapUtils from './utils/mapUtils.js';
import DOMUtils from './utils/domUtils.js';
import LangControl from './controls/langControl.js';
import HelpControl from './controls/helpControl.js';
import LocationControl from './controls/locationControl.js';
import DrawControl from './controls/drawControl.js';
import LayersControl from './controls/layersControl.js';
import SearchControl from './controls/searchControl.js';

/**
 * Main App class responsible for creating and managing the application.
 */
export default class App {
    /**
     * Creates a new instance of the App.
     * 
     * @param {Object} config - Configurations for the application.
     */
    constructor(config) {
        this.config = config;            // General application settings
        this.layers = {};                // Stores map layers
        this.controls = {};              // Stores map controls
        this.bbox = null;                // Bounding box for map area
        this.urlUtils = new URLUtils();  // Utility for handling URLs
        this.domUtils = new DOMUtils();  // Utility for handling DOM
    }

    /**
     * Initializes the application, setting up the map, its layers, and associated events.
     */
    createApp() {
        // Creates a new map with the defined settings
        this.map = L.map('map', {
            minZoom: this.config.map.minZoom,
            maxZoom: this.config.map.maxZoom
        })
        .setView(this.config.map.latLng, this.config.map.zoom);

        // Removes zoom control if not enabled in the settings
        if (!this.config.map.zoomControl) {
            this.map.removeControl(this.map.zoomControl);
        }

        // Creates a new MapUtils instance to assist with map operations
        this.mapUtils = new MapUtils(this.map, this.config.map);

        // Sets up map layers and events
        this._createLayers();
        this._bindMapEvents();
    }

    /**
     * Initializes map layers. Sets up drawing, marker, and base layers.
     * @private
     */
    _createLayers() {
        // Creating a layer to draw features and adding it to the map
        this.layers.draw = L.featureGroup().addTo(this.map);

        // Creating a cluster group for markers and adding it to the map
        this.layers.marker = L.markerClusterGroup().addTo(this.map);

        // Base layers: OSM and Satellite
        this.layers.base = this._createBaseLayers();

        // Setting the default base layer as per configuration
        const defaultBaseLayer = this.layers.base[this.config.map.defaultLayer];
        if (defaultBaseLayer) {
            defaultBaseLayer.addTo(this.map);
        }
    }

    /**
     * Creates the base layers for the map (OSM and Satellite).
     * @returns {Object} The base layers.
     * @private
     */
    _createBaseLayers() {
        return {
            'OSM': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            'Satellite': L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token=${this.config.app.mapBox_token}`, {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox/satellite-v9',
                tileSize: 512,
                zoomOffset: -1
            })
        };
    }

    /**
     * Binds the necessary events to the map. This includes events such as map readiness, 
     * location found, drawing start, drawing creation, and drawing deletion.
     * @private
     */
    _bindMapEvents() {
        // Bind map readiness event
        this.map.onMapReady = this._onMapReady();

        // Bind other map events
        this.map.on('locationfound', this._onLocationFound.bind(this));
        this.map.on('draw:drawstart', this._onDrawStart.bind(this));
        this.map.on('draw:created', this._onDrawCreated.bind(this));
        this.map.on('draw:deleted', this._onDrawDeleted.bind(this));
    }

    /**
     * Clears any existing drawing layers from the map.
     */
    clearDrawLayers() {
        this.layers.draw.clearLayers();
    }

    clearMarkerLayers() {
        this.layers.marker.clearLayers();
    }

    /**
     * Clears all search results, pagination, and markers from the map.
     */
    clearAll() {
        this.controls.searchControl.clearSearchItems();
        this.controls.searchControl.populatePaginationContainer('');
        this.clearMarkerLayers();
    }

    /**
     * Creates a marker on the map based on the given item's data.
     * @param {Object} item - The data object representing the marker. 
     *                        It contains geolocation data, photo links, and more.
     */
    createMarker(item) {
        const latLng = this.getLatLngFromItem(item);
        const popupContent = this.setPopupContent(item);

        // Construct the marker with the given data and attach it to the map
        const marker = this._buildMarker(latLng, item.id, popupContent);

        // Attach a tooltip to the marker if the app is not in mobile mode
        if (!this.mapUtils.isMobile) {
            this._attachTooltipToMarker(marker, item);
        }

        // Bind popup events
        marker.on('popupopen', this._onPopupOpen.bind(this));
        marker.on('popupclose', this._onPopupClose.bind(this));
        marker.on('mouseover', this._onMarkerMouseOver.bind(this));
    }

    /**
     * Extracts latitude and longitude from the given item.
     * @param {Object} item - The data object.
     * @returns {Array} An array representing the latitude and longitude.
     * @private
     */
    getLatLngFromItem(item) {
        return item.geojson.coordinates.reverse();
    }

    /**
     * Constructs a marker using the provided latitude-longitude, ID, and popup content.
     * @param {Array} latLng - Latitude and longitude.
     * @param {Number} id - ID of the item.
     * @param {String} popupContent - The content to be displayed in the marker's popup.
     * @returns {Object} The constructed marker.
     * @private
     */
    _buildMarker(latLng, id, popupContent) {
        const marker = L.marker(latLng, { id })
            .bindPopup(popupContent, {
                closeOnClick: false,
                closeOnEscapeKey: false
            })
            .addTo(this.layers.marker);

        return marker;
    }

    /**
     * Attaches a tooltip to the given marker.
     * @param {Object} marker - The marker to attach the tooltip to.
     * @param {Object} item - The data object to extract tooltip content from.
     * @private
     */
    _attachTooltipToMarker(marker, item) {
        const thumbnailSrc = this.controls.searchControl.getThumbnailSource(item);
        const thumbnailMarkup = this.domUtils.generateThumbnailMarkup(thumbnailSrc);
        const speciesName = this.controls.searchControl.getSpeciesName(item);

        const tooltipContent = `
            <div class="d-flex flex-column align-items-center">
                <div>${speciesName}</div>
                ${thumbnailMarkup}
            </div>
        `;

        marker.bindTooltip(tooltipContent).addTo(this.layers.marker);
    }

    setPopupContent(item) {
        const card = this.domUtils.createCardElement();
        card.appendChild(this._createCardImageTop(item));
        card.appendChild(this._createCardBody(item));
        card.appendChild(this._createCardFooter(item.created_at));

        return card;
    }

    _createCardImageTop(item) {
        const cardImgTop = document.createElement('div');
        cardImgTop.className = 'card-img-top';

        const carousel = this._createCarouselElement(item);
        cardImgTop.appendChild(carousel);

        return cardImgTop;
    }

    _createCarouselElement(item) {
        const carouselId = `carousel_${item.id}`;
        
        const carousel = document.createElement('div');
        carousel.id = carouselId;
        carousel.className = 'carousel carousel-dark slide';
    
        const carouselInner = document.createElement('div');
        carouselInner.className = 'carousel-inner';
    
        // Add images to carousel
        const photos = item.observation_photos;
        if (photos && photos.length) {
            for (const [photoIndex, photoItem] of photos.entries()) {
                const carouselImageItem = this._createCarouselImageItem(item.taxon.preferred_common_name, photoItem, photoIndex);
                carouselInner.appendChild(carouselImageItem);
            }
        }
    
        // Add sounds to carousel
        const sounds = item.observation_sounds;
        if (sounds && sounds.length) {
            for (const [soundIndex, soundItem] of sounds.entries()) {
                const carouselSoundItem = this._createCarouselSoundItem(soundItem, soundIndex, photos);
                carouselInner.appendChild(carouselSoundItem);
            }
        }
    
        carousel.appendChild(carouselInner);
    
        // Add carousel controls if more than one item
        const countItems = ((photos && Array.isArray(photos) && photos.length) || 0) + ((sounds && Array.isArray(sounds) && sounds.length) || 0);
        if (countItems > 1) {
            carousel.appendChild(this.domUtils.createCarouselControls(carouselId));
        }
    
        return carousel;
    }

    _createCarouselImageItem(itemName, photoItem, photoIndex) {
        const photoUrl = photoItem.photo.url.replace('square', 'large');
    
        const itemImg = document.createElement('img');
        itemImg.src = photoUrl;
        itemImg.className = 'd-block w-auto mx-auto';
        itemImg.style.maxHeight = '10rem';
        itemImg.style.cursor = 'zoom-in';
    
        const itemAction = document.createElement('a');
        itemAction.href = '#';
        itemAction.addEventListener('click', (e) => {
            this.domUtils.openImageModal(itemName, photoUrl);
        }, false);
        itemAction.appendChild(itemImg);
    
        const itemContent = document.createElement('div');
        itemContent.className = `carousel-item ${photoIndex === 0 ? 'active' : ''}`;
        itemContent.appendChild(itemAction);
    
        return itemContent;
    }

    _createCarouselSoundItem(soundItem, soundIndex, photos) {
        const soundUrl = soundItem.sound.file_url;
    
        const audioControl = document.createElement('audio');
        audioControl.controls = true;
        audioControl.className = 'd-block w-75 mx-auto';
    
        const audioSource = document.createElement('source');
        audioSource.src = soundUrl;
        audioSource.className = 'd-block w-auto mx-auto';
        audioControl.appendChild(audioSource);
    
        const soundContent = document.createElement('div');
        soundContent.className = `carousel-item ${!photos.length && soundIndex === 0 ? 'active' : ''}`;
        soundContent.appendChild(audioControl);
    
        return soundContent;
    }

    _createCardBody(item) {
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
    
        // Create the card title
        const cardTitle = document.createElement('h6');
        cardTitle.className = 'card-title';
        cardTitle.textContent = item.taxon.preferred_common_name;
    
        const taxonName = document.createElement('small');
        taxonName.className = 'text-body-secondary';
        taxonName.textContent = `(${item.taxon.name})`;
        cardTitle.appendChild(document.createElement('br'));
        cardTitle.appendChild(taxonName);
        cardBody.appendChild(cardTitle);
    
        // Description
        if (item.description) {
            const popupDescription = document.createElement('div');
            popupDescription.className = 'popup-description overflow-auto pt-2';
    
            const cardSubtitle = document.createElement('h6');
            cardSubtitle.className = 'card-subtitle mb-2 text-body-secondary';
            cardSubtitle.textContent = item.description;
            popupDescription.appendChild(cardSubtitle);
    
            cardBody.appendChild(popupDescription);
        }
    
        // Place
        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = item.place_guess;
        cardBody.appendChild(cardText);
    
        // User details
        const userLink = this._createUserLink(item);
        cardBody.appendChild(userLink);
    
        // External links
        const linkContainer = this._createLinkContainer(item);
        cardBody.appendChild(linkContainer);
    
        return cardBody;
    }
    
    _createUserLink(item) {
        const userLink = document.createElement('a');
        userLink.href = `https://www.inaturalist.org/people/${item.user.id}`;
        userLink.target = "_blank";
        userLink.className = 'card-link d-flex justify-content-between align-items-center';
    
        const userImage = document.createElement('img');
        userImage.className = 'img-thumbnail rounded';
        userImage.src = item.user.icon || 'https://www.inaturalist.org/attachment_defaults/users/icons/defaults/thumb.png';
        userLink.appendChild(userImage);
    
        const userNameSpan = document.createElement('span');
        userNameSpan.className = 'text-wrap ms-2';
        userNameSpan.style.width = '12rem';
        userNameSpan.textContent = `${this.controls.langControl.translate('Registered by')} ${item.user.name || item.user.login}`;
        userLink.appendChild(userNameSpan);
    
        return userLink;
    }
    
    _createLinkContainer(item) {
        const linkContainer = document.createElement('div');
        linkContainer.className = 'mt-3';
    
        const inatLink = document.createElement('a');
        inatLink.href = item.uri;
        inatLink.target = "_blank";
        inatLink.className = 'btn btn-success btn-sm text-white me-2';
        inatLink.textContent = 'iNaturalist';
        linkContainer.appendChild(inatLink);
    
        if (this.controls.langControl.lang === 'pt-BR') {
            const wikiavesLink = document.createElement('a');
            wikiavesLink.href = `https://www.wikiaves.com.br/wiki/${item.taxon.preferred_common_name}`;
            wikiavesLink.target = "_blank";
            wikiavesLink.className = 'btn btn-danger btn-sm text-white';
            wikiavesLink.textContent = 'WikiAves';
            linkContainer.appendChild(wikiavesLink);
        }
        else {
            const allaboutbirdsLink = document.createElement('a');
            const nameLink = item.taxon.preferred_common_name.replaceAll(' ', '_');
            allaboutbirdsLink.href = `https://www.allaboutbirds.org/guide/${nameLink}`;
            allaboutbirdsLink.target = "_blank";
            allaboutbirdsLink.className = 'btn btn-outline-secondary btn-sm text-dark';
            allaboutbirdsLink.textContent = 'All About Birds';
            linkContainer.appendChild(allaboutbirdsLink);
        }
    
        return linkContainer;
    }

    _createCardFooter(createdAt) {
        const formattedDate = new Date(createdAt).toLocaleDateString(this.controls.langControl.lang);
        
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer text-body-secondary';
        cardFooter.textContent = `${this.controls.langControl.translate('Registered in')} ${formattedDate}`;

        return cardFooter;
    }

    /**
     * Opens or closes a marker's popup based on the given target.
     * 
     * @param {Element} target - The HTML element that triggered the openPopup action. It's expected to have an ID in the format "prefix_id".
     */
    openPopup(target) {
        const id = this.domUtils.extractIdFromTarget(target);
        const marker = this.mapUtils.findMarkerById(id, this.layers.marker);

        if (target.classList.contains('active')) {
            this._closeMarkerPopup(marker);
        }
        else {
            this._openMarkerPopup(marker);
        }
    }

    /**
     * Closes the popup of the given marker and adjusts the map's bounds.
     * 
     * @param {Object} marker - The marker whose popup needs to be closed.
     * @private
     */
    _closeMarkerPopup(marker) {
        marker.closePopup();
        const bounds = this.bbox || this.layers.marker.getBounds();
        this.mapUtils.fitMapBounds(bounds);
    }

    /**
     * Opens the popup of the given marker and adjusts the map's bounds.
     * If the marker is in a cluster, it will zoom to show the marker before opening the popup.
     * 
     * @param {Object} marker - The marker whose popup needs to be opened.
     * @private
     */
    _openMarkerPopup(marker) {
        const latLng = marker.getLatLng();
        const bounds = L.latLngBounds(latLng, latLng);
        
        setTimeout(() => {
            const cluster = this.layers.marker.getVisibleParent(marker);
            if (cluster) {
                this.layers.marker.zoomToShowLayer(marker, () => {
                    marker.openPopup();
                });
            }
            else {
                marker.openPopup();
            }
        }, 500);

        if (this.mapUtils.isMobile) {
            this.domUtils.hideCollapses();
        }

        this.mapUtils.fitMapBounds(bounds);
    }

    /**
     * Callback executed when the map is ready.
     * Initializes various controls and adds them to the map.
     * @private
     */
    async _onMapReady() {
        await this._initLanguageControl();
        this._initHelpControl();
        this._initLocationControl();
        this._initDrawControl();
        this._initLayersControl();
        this._initSearchControl();
    }

    /**
     * Initializes the language control.
     * Sets the language and creates the control.
     * @private
     */
    async _initLanguageControl() {
        this.controls.langControl = new LangControl(this);
        await this.controls.langControl.setLang();
        this.controls.langControl.createControl();
    }

    /**
     * Initializes the help control and adds it to the map.
     * @private
     */
    _initHelpControl() {
        this.controls.helpControl = new HelpControl(this);
        this.controls.helpControl.createControl();
    }

    /**
     * Initializes the location control and adds it to the map.
     * @private
     */
    _initLocationControl() {
        this.controls.locationControl = new LocationControl(this);
        this.controls.locationControl.createControl();
    }

    /**
     * Initializes the drawing control and adds it to the map.
     * @private
     */
    _initDrawControl() {
        this.controls.drawControl = new DrawControl(this);
        this.controls.drawControl.createControl();
    }

    /**
     * Initializes the layers control and adds it to the map.
     * @private
     */
    _initLayersControl() {
        this.controls.layersControl = new LayersControl(this);
        this.controls.layersControl.createControl();
    }

    /**
     * Initializes the search control and adds it to the map.
     * @private
     */
    _initSearchControl() {
        this.controls.searchControl = new SearchControl(this);
        this.controls.searchControl.createControl();
    }

    /**
     * Callback executed when a user's location is found.
     * This method adds a marker to the user's location and draws a circle based on the selected buffer range.
     * @param {Object} event - The location found event object containing latlng details.
     * @private
     */
    _onLocationFound(event) {
        // Create and add a marker to the user's location
        this._addUserLocationMarker(event.latlng);
        
        // Draw a circle around the user's location based on the buffer range input value
        this._drawBufferCircle(event.latlng);
        
        // Adjust the map view to fit the bounds of the drawn circle
        this.mapUtils.fitMapBounds(this.bbox);
        
        // Execute a search based on the defined bounds
        this.controls.searchControl.search();
    }

    /**
     * Creates and adds a marker to the specified location.
     * @param {Object} latLng - Latitude and longitude coordinates of the location.
     * @private
     */
    _addUserLocationMarker(latLng) {
        L.marker(latLng, {
            icon: L.divIcon({
                html: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
                className: 'text-primary border-dark-subtle shadow-lg',
                popupAnchor: [9, 0]
            })
        })
        .bindTooltip(this.controls.langControl.translate('You'))
        .addTo(this.layers.draw)
        .openTooltip();
    }
    
    /**
     * Draws a buffer circle around the specified location based on the buffer range input value.
     * @param {Object} latLng - Latitude and longitude coordinates of the location.
     * @private
     */
    _drawBufferCircle(latLng) {
        const radiusInKm = parseInt(document.querySelector('#bufferRangeInput').value, 10);
        const radiusInM = radiusInKm * 1000;
        const circle = L.circle(latLng, { radius: radiusInM })
            .addTo(this.layers.draw);
        
        this.bbox = circle.getBounds();
    }

    _onDrawStart(event) {
        this.map.closePopup(); 
        this.domUtils.hideCollapses();
    }

    /**
     * Callback executed when a new shape is drawn on the map.
     * This method updates the bounding box (bbox) property based on the drawn shape and triggers a search.
     * @param {Object} event - The draw event object containing details about the drawn layer.
     * @private
     */
    _onDrawCreated(event) {
        // Reset the search page counter
        this.controls.searchControl.resetSearchPage();

        // Clear any existing drawing layers
        this.clearDrawLayers();

        // Set the bounding box based on the type of shape drawn
        this.bbox = this.mapUtils.getBoundingBoxFromDrawnLayer(event.layer, event.layerType);
        
        // Add the drawn layer to the map
        this._addDrawnLayerToMap(event.layer);

        // Execute a search based on the defined bounding box
        this.controls.searchControl.search();
    }

    _onDrawDeleted(event) {
        this.bbox = null;
        this.clearAll();
    }

    /**
     * Adds the provided layer to the drawing layers group on the map.
     * @param {Object} layer - The layer to add to the map.
     */
    _addDrawnLayerToMap(layer) {
        this.layers.draw.addLayer(layer);
    }

    /**
     * Callback executed when a popup is opened on the map.
     * This method adjusts the map's view and updates the associated DOM element's styling.
     * @param {Object} event - The popup open event object containing details about the opened popup.
     * @private
     */
    _onPopupOpen(event) {
        // Extract relevant data from the event
        const popup = event.popup;
        const id = this.domUtils.extractIDFromEvent(event);

        // Highlight and focus the corresponding DOM element
        this.domUtils.highlightElement(`#item_${id}`);

        // Adjust map's view based on the popup's location
        this.mapUtils.adjustMapViewBasedOnPopup(popup.getLatLng());
    }

    /**
     * Callback executed when a popup is closed on the map.
     * This method updates the associated DOM element's styling to indicate it's no longer active.
     * @param {Object} event - The popup close event object containing details about the closed popup.
     * @private
     */
    _onPopupClose(event) {
        const id = this.domUtils.extractIDFromEvent(event);
        this.domUtils.unhighlightElement(`#item_${id}`);
    }

    _onMarkerMouseOver(event) {
        const tooltips = document.querySelectorAll('.leaflet-tooltip');
        const lastTooltip = tooltips[tooltips.length - 1];
        
        this.domUtils.setupThumbnailEventHandlers(lastTooltip);
    }
}