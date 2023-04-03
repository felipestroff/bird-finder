// Global variables
var map;
var drawLayer, markersLayer;
var bbox;
var page = 1;
var speciesControl_collapse, locationControl_collapse;

// Methods
function createMap() {
    map = L.map('map', {
        minZoom: config.map.minZoom
    })
    .setView(config.map.latLng, config.map.zoom);

    map.removeControl(map.zoomControl);

    map.on('locationfound', onLocationFound);
    map.on('draw:drawstart', onDrawStart);
    map.on('draw:created', onDrawCreated);
    map.on('draw:deleted', onDrawDeleted);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | ${translate('Developed and maintained by')} <a href="https://www.linkedin.com/in/felipestroff" target="_blank">Felipe Stroff</a>`
    })
    .addTo(map);

    createLocationControl();
    createDrawControl();
    createLangControl();
    createHelpControl();
    createSpeciesControl();
}

function createLocationControl() {
    L.Control.location = L.Control.extend({
        position: 'topright',
        onAdd: function() {
            return locationControl;
        }
    });
    L.control.location = function(opts) {
        return new L.Control.location(opts);
    }
    L.control.location({
        position: 'topleft'
    })
    .addTo(map);

    locationControl_collapse = new bootstrap.Collapse('#locationControlContent', {
        toggle: false
    });

    locationControlForm.innerHTML = `
        <h6>${translate('To search for species from your location, first define an area around it and then click on the button')}.</h6>
        <div class="mb-3">
            <label for="bufferRange" class="form-label">${translate('Buffer')}</label>
            <input type="range" class="form-range" id="bufferRange" min="1" value="10" onchange="onBufferChange(this.value)">
            <div id="bufferHelp" class="form-text">10 ${translate('kilometers')}</div>
        </div>
        <div class="d-flex justify-content-end">
            <button class="btn btn-primary btn-sm" type="submit">${translate('Search')}</button>
        </div>
    `;

    locationControlForm.addEventListener('submit', onLocationSubmit, false);

    // Mobile
    if (isMobile) {
        locationControl.addEventListener('touchstart', onControlOver, false);
        locationControl.addEventListener('touchend', onControlOut, false);
    }
    // Desktop
    else {
        locationControl.addEventListener('mouseover', onControlOver, false);
        locationControl.addEventListener('mouseout', onControlOut, false);
    }
}

function createDrawControl() {
    L.drawLocal.draw.handlers.circle.radius = translate('Radius');
    L.drawLocal.draw.handlers.circle.tooltip.start = translate('Click and drag to draw circle');
    L.drawLocal.draw.handlers.polygon.tooltip.cont = translate('Click to continue drawing shape');
    L.drawLocal.draw.handlers.polygon.tooltip.end = translate('Click first point to close this shape');
    L.drawLocal.draw.handlers.polygon.tooltip.start = translate('Click to start drawing shape');
    L.drawLocal.draw.handlers.rectangle.tooltip.start = translate('Click and drag to draw rectangle');
    L.drawLocal.draw.handlers.simpleshape.tooltip.end = translate('Release to finish drawing');
    L.drawLocal.draw.toolbar.actions.text = translate('Cancel');
    L.drawLocal.draw.toolbar.actions.title = translate('Cancel drawing');
    L.drawLocal.draw.toolbar.buttons.polygon = translate('Draw a polygon');
    L.drawLocal.draw.toolbar.buttons.rectangle = translate('Draw a rectangle');
    L.drawLocal.draw.toolbar.buttons.circle = translate('Draw a circle');
    L.drawLocal.draw.toolbar.finish.text = translate('Finish');
    L.drawLocal.draw.toolbar.finish.title = translate('Finish drawing');
    L.drawLocal.draw.toolbar.undo.text = translate('Delete last point');
    L.drawLocal.draw.toolbar.undo.title = translate('Delete last point drawn');

    L.drawLocal.edit.handlers.remove.tooltip.text = translate('Click on a feature to remove');
    L.drawLocal.edit.toolbar.actions.cancel.text = translate('Cancel');
    L.drawLocal.edit.toolbar.actions.cancel.title = translate('Cancel editing, discards all changes');
    L.drawLocal.edit.toolbar.actions.clearAll.text = translate('Clear All');
    L.drawLocal.edit.toolbar.actions.clearAll.title = translate('Clear all layers');

    drawLayer = L.featureGroup().addTo(map);

    new L.Control.Draw({
        edit: {
            featureGroup: drawLayer,
            edit: false
        },
        draw: {
            circlemarker: false,
            marker: false,
            polyline: false
        }
    })
    .addTo(map);
}

function createLangControl() {
    L.Control.lang = L.Control.extend({
        position: 'bottomleft',
        onAdd: function() {
            return langControl;
        }
    });
    L.control.lang = function(opts) {
        return new L.Control.lang(opts);
    }
    L.control.lang({
        position: 'bottomleft'
    })
    .addTo(map);

    const langIcon = `<img src="./src/assets/images/${lang}.png" style="height: 14px;">`;
    langControlBtn.innerHTML = langIcon;
    langControlBtn.title = lang;
    langControlBtn.addEventListener('click', changeAppLang, false);
}

function createHelpControl() {
    L.Control.help = L.Control.extend({
        position: 'bottomleft',
        onAdd: function() {
            return helpControl;
        }
    });
    L.control.help = function(opts) {
        return new L.Control.help(opts);
    }
    L.control.help({
        position: 'bottomleft'
    })
    .addTo(map);

    helpControlBtn.title = translate('Help');
    helpControlContent.innerHTML = `<ul class="list-group list-group-flush">
        <li class="list-group-item">
            ${translate('To search for a location and get more accurate results, type for example: City, State')}
        </li>
        <li class="list-group-item">
            ${translate('It is also possible to search the species by common names of the region or scientific name')}
        </li>
        <li class="list-group-item">
            ${translate('When you finish your search, you can click on the desired species in the list or on the map markers to see more details about it')}
        </li>
    </ul>`;
}

function createSpeciesControl() {
    markersLayer = L.markerClusterGroup({
        retainPopup: true
    })
    .addTo(map);

    L.Control.species = L.Control.extend({
        position: 'topright',
        onAdd: function() {
            return speciesControl;
        }
    });
    L.control.species = function(opts) {
        return new L.Control.species(opts);
    }
    L.control.species({
        position: 'topright'
    })
    .addTo(map);

    speciesControl_collapse = new bootstrap.Collapse('#speciesControlContent', {
        toggle: true
    });

    speciesSearchForm.addEventListener('submit', onSearchSubmit, false);

    specieSearchInput.setAttribute('placeholder', translate('Type here'));
    specieSearchInput.addEventListener('change', onSearchInputChange, false);

    specieSearchBtn.addEventListener('click', search, false);

    // Mobile
    if (isMobile) {
        speciesControl.addEventListener('touchstart', onControlOver, false);
        speciesControl.addEventListener('touchend', onControlOut, false);
    }
    // Desktop
    else {
        speciesControl.addEventListener('mouseover', onControlOver, false);
        speciesControl.addEventListener('mouseout', onControlOut, false);
    }

    setDefaultContent();
}

async function search() {
    const term = specieSearchInput.value;
    if (term || bbox) {
        locationControl_collapse.hide();
        speciesControl_collapse.show();

        toggleLoader(true);

        const data = await querySpecies(term, bbox);
        if (data) {
            createSpeciesList(data);
        }
    }
}

async function querySpecies(term, bbox) {
    const params = config.iNaturalist.params;
    params.page = page;
    params.locale = lang;

    if (term) {
        params.q = term;
    }
    else {
        delete params.q;
    }

    if (bbox) {
        params.nelat = bbox._northEast.lat;
        params.nelng = bbox._northEast.lng;
        params.swlat = bbox._southWest.lat;
        params.swlng = bbox._southWest.lng;
    }
    else {
        delete params.nelat;
        delete params.nelng;
        delete params.swlat;
        delete params.swlng;
    }

    const response = await fetch(`${config.iNaturalist.apiUrl}/observations?` + new URLSearchParams(params));
    return response.json();
}

function createSpeciesList(data) {
    clearAll();

    page = data.page;

    const results = filterResults(data.results);
    if (results.length) {
        for (const item of results) {
            const specieItem = createSpecieItem(item);
            speciesList.innerHTML += specieItem;

            createMarker(item);
        }

        const totalResults = data.total_results;
        
        let totalPages = totalResults / config.iNaturalist.params.per_page;
        if (totalPages % 1 !== 0) {
            totalPages = parseInt(totalPages) + 1;
        }

        if (totalResults > config.iNaturalist.params.per_page) {
            createPagination(totalResults, totalPages);
        }

        const bounds = bbox || markersLayer.getBounds();
        map.fitBounds(bounds);
    }
    else {
        setNoResultsFound();
    }

    toggleLoader(false);
}

function filterResults(results) {
    return results.filter(item => item.geojson);
}

function createMarker(item) {
    const latLng = item.geojson.coordinates.reverse();
    const popupContent = setPopupContent(item);

    const marker = L.marker(latLng, {
        id: item.id
    })
    .bindPopup(popupContent)
    .addTo(markersLayer);

    marker.on('popupopen', onPopupOpen);
    marker.on('popupclose', onPopupClose);
}

function clearMarkers() {
    markersLayer.clearLayers();
}

function setPopupContent(item) {
    const createdAt = new Date(item.created_at).toLocaleDateString(lang);
    const carouselId = `carousel_${item.id}`;

    let carouselItems = '';
    const photos = item.observation_photos;
    const sounds = item.observation_sounds;
    // Images
    if (photos && photos.length) {
        for (const [photoIndex, photoItem] of photos.entries()) {
            const photoUrl = photoItem.photo.url.replace('square', 'large');

            carouselItems += `<div class="carousel-item ${photoIndex === 0 ? 'active' : ''}">
                <img src="${photoUrl}" class="d-block w-auto mx-auto" style="max-height: 10rem;">
            </div>`;
        }
    }

    // Sounds
    if (sounds && sounds.length) {
        for (const [soundIndex, soundItem] of sounds.entries()) {
            const soundUrl = soundItem.sound.file_url;

            carouselItems += `<div class="carousel-item ${!photos.length && soundIndex === 0 ? 'active' : ''}">
                <audio controls class="d-block w-75 mx-auto">
                    <source src="${soundUrl}" class="d-block w-auto mx-auto">
                </audio>
            </div>`;
        }
    }

    const countItems = (photos && photos.length) + (sounds && sounds.length);
    let carouselControls = '';
    if (countItems > 1) {
        carouselControls = `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
        `;
    }

    let wikiaves_link = '';
    let allaboutbirds_link = '';
    if (lang === 'pt-BR') {
        wikiaves_link = `<a href="https://www.wikiaves.com.br/wiki/${item.taxon.preferred_common_name}" target="_blank" class="btn btn-danger btn-sm text-white">WikiAves</a>`;
    }
    else {
        const nameLink = item.taxon.preferred_common_name.replaceAll(' ', '_');
        allaboutbirds_link = `<a href="https://www.allaboutbirds.org/guide/${nameLink}" target="_blank" class="btn btn-light btn-sm text-dark">All About Birds</a>`;
    }

    return `<div class="card" style="width: 18rem;">
        <div class="card-img-top">
            <div id="${carouselId}" class="carousel carousel-dark slide">
                <div class="carousel-inner">${carouselItems}</div>
                ${carouselControls}
            </div>
        </div>
        <div class="card-body">
            <h5 class="card-title">${item.taxon.preferred_common_name}</h5>
            <div class="popup-description overflow-auto ${!item.description ? 'd-none' : ''}">
                <h6 class="card-subtitle mb-2 text-body-secondary">
                    ${item.description || ''}
                </h6>
            </div>
            <p class="card-text">${item.place_guess}</p>
            <a href="https://www.inaturalist.org/people/${item.user.id}" target="_blank" class="card-link d-flex justify-content-between align-items-center">
                <img class="img-thumbnail rounded" src="${item.user.icon || './src/assets/images/icon-192x192.png'}" style="height: 48px;">
                <span class="text-wrap ms-2" style="width: 12rem;">
                    ${translate('Registered by')} ${item.user.name || item.user.login}
                </span>
            </a>
            <div class="mt-3">
                <a href="${item.uri}" target="_blank" class="btn btn-success btn-sm text-white">iNaturalist</a>
                ${wikiaves_link}
                ${allaboutbirds_link}
            </div>
        </div>
        <div class="card-footer text-body-secondary">
            ${translate('Registered in')} ${createdAt}
        </div>
    <div>`;
}

function openPopup(target, id) {
    const marker = markersLayer.getLayers().find(layer => {
        return layer.options.id === id;
    });

    let bounds;
    
    if (!target.classList.contains('active')) {
        const latLng = marker.getLatLng();
        bounds = L.latLngBounds(latLng, latLng);

        setTimeout(() => {
            const cluster = markersLayer.getVisibleParent(marker);
            if (cluster) {
                markersLayer.zoomToShowLayer(marker, () => {
                    marker.openPopup();
                });
            }
            else {
                marker.openPopup();
            }
        }, 500);

        if (isMobile) {
            locationControl_collapse.hide();
            speciesControl_collapse.hide();
        }
    }
    else {
        marker.closePopup();

        bounds = bbox || markersLayer.getBounds();
    }

    map.fitBounds(bounds);
}

function createSpecieItem(item) {
    console.log(item)

    let thumbnail;
    if (item.observation_photos.length) {
        thumbnail = `<img class="img-thumbnail rounded" src="${item.observation_photos[0].photo.url}" style="height: 75px;">`;
    }
    else {
        thumbnail = '<img class="img-thumbnail rounded" src="./src/assets/images/sound.png" style="height: 75px;">';
    }

    let name;
    if (item.taxon.preferred_common_name) {
        name = item.taxon.preferred_common_name;
    }
    else if (item.taxon.english_common_name) {
        name = item.taxon.english_common_name;
    }
    else if (item.species_guess) {
        name = item.species_guess;
    }
    else {
        name = translate('Unnamed');
    }

    const specieItem = `<div>
        <a href="#" id="item_${item.id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onclick="openPopup(this, ${item.id})"
        >
            ${thumbnail}
            <h6 class="text-wrap ms-2" style="width: 12rem;">
                ${item.taxon.preferred_common_name || item.taxon.english_common_name}
            </h6>
        </a>
    </div>`;
    
    return specieItem;
}

function setDefaultContent() {
    actions.innerHTML = `
        <button class="btn btn-light btn-sm border-dark-subtle" type="button" onclick="setDefaultExtent()" title="${translate('Default view')}">
            <i class="bi bi-globe-americas"></i>
        </button>
        <button class="btn btn-light btn-sm border-dark-subtle" type="button" onclick="clearFilters()" title="${translate('Clear filters')}">
            <i class="bi bi-arrow-clockwise"></i>
        </button>
    `;

    speciesList.innerHTML = `<div class="p-3">
        <h6>${translate('Enter above or select an area to begin your bird species search')}.</h6>
        <h6>${translate('To do so, use the drawing tools located on the left side')}.</h6>
    </div>`;
}

function createPagination(totalResults, totalPages) {
    speciesPagination.innerHTML = `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="paginate(${page - 1}, ${totalPages})">&laquo;</a>
        </li>
        <li class="page-item">
            <input class="form-control text-center" type="number" value="${page}" min="1" max="${totalPages}" onchange="paginate(this.value, ${totalPages})">
        </li>
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="paginate(${page + 1}, ${totalPages})">&raquo;</a>
        </li>
    `;
}

function setDefaultExtent() {
    map.setView(config.map.latLng, config.map.zoom);
}

function clearFilters() {
    bbox = null;
    specieSearchInput.value = '';

    drawLayer.clearLayers();

    clearAll();
    setDefaultContent();
}

function setNoResultsFound() {
    speciesList.innerHTML = `<div class="p-3">
        <h6>${translate('No results found')}.</h6>
        <h6>${translate('Please try again with other filters')}.</h6>
    </div>`;

    clearPagination();
}

function clearSpeciesList() {
    speciesList.innerHTML = '';
}

function clearPagination() {
    speciesPagination.innerHTML = '';
}

function clearAll() {
    clearMarkers();
    clearSpeciesList();
    clearPagination();
}

function paginate(pageNumber, totalPages) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        page = pageNumber;
        
        search();
    }
}

function toggleLoader(bool) {
    if (bool) {
        loader.classList.remove('d-none');
    }
    else {
        loader.classList.add('d-none');
    }
}

// Events
// Map
function onLocationFound(event) {
    const latLng = event.latlng;
    const marker = L.marker(latLng, {
        icon: L.divIcon({
            html: '<i class="bi bi-person-fill" style="font-size: 38px;"></i>',
            className: 'text-primary border-dark-subtle shadow-lg',
            iconAnchor: [0, 0],
            popupAnchor: [19, 16]
        })
    })
    .bindPopup(`<h6>${translate('You')}</h6>`)
    .addTo(drawLayer)
    .openPopup();

    const radiusInKm = parseInt(bufferRange.value);
    const radiusInM = radiusInKm * 1000;
    const circle = L.circle(latLng, {
        radius: radiusInM
    })
    .addTo(drawLayer);

    bbox = circle.getBounds();

    map.fitBounds(bbox);

    search();
}

function onDrawStart(event) {
    map.closePopup();

    locationControl_collapse.hide();
    speciesControl_collapse.hide();
}

function onDrawCreated(event) {
    page = 1;

    drawLayer.clearLayers();
    
    const layer = event.layer;

    if (event.layerType !== 'circle') {
        bbox = layer.getBounds(); 
    }
    else {
        const latLng = layer.getLatLng();
        const radius = layer.getRadius();

        bbox = latLng.toBounds(radius);
    }

    drawLayer.addLayer(layer);

    search();
}

function onDrawDeleted(event) {
    bbox = null;

    clearAll();
    setDefaultContent();

    toggleLoader(false);
}

// Controls
function onControlOver() {
    map.dragging.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
}

function onControlOut() {
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
}

function onBufferChange(value) {
    bufferHelp.innerText = value + ' ' + translate('kilometers');
}

function onLocationSubmit(event) {
    event.preventDefault();

    drawLayer.clearLayers();

    map.locate({
        enableHighAccuracy: true
    });
}

function onSearchSubmit(event) {
    event.preventDefault();

    search();
}

function onSearchInputChange() {
    page = 1;
}

function onPopupOpen(event) {
    const popup = event.popup;
    const id = event.target.options.id;
    const item = document.getElementById(`item_${id}`);
    item.classList.add('active');
    item.focus();

    const latLng = popup.getLatLng();
    const newLat = latLng.lat + 0.0010;
    const newLatLng = [newLat, latLng.lng];

    map.setView(newLatLng);
}

function onPopupClose(event) {
    const id = event.target.options.id;
    const item = document.getElementById(`item_${id}`);
    item.classList.remove('active');
}