// Global variables
const isMobile = L.Browser.mobile;

let config;
let map;
let drawnLayerGroup;
let speciesLayerGroup;
let speciesWidgetCollapse;
let bbox;
let totalPages = 1;
let page = 1;
let totalResults = 0;

// Methods
async function init() {
    config = await fetchConfig();

    createMap();
}

async function fetchConfig() {
    const response = await fetch(`./config.json`);
    return response.json();
}

function createMap() {
    map = L.map('map').setView(config.map.latLng, config.map.zoom);
    map.on('draw:drawstart', onDrawStart);
    map.on('draw:created', onDrawCreated);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    .addTo(map);

    createControls();
}

function createControls() {
    // Draw
    drawnLayerGroup = L.featureGroup().addTo(map);
    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnLayerGroup,
            edit: false,
            remove: false
        },
        draw: {
            circlemarker: false,
            marker: false,
            polyline: false
        }
    });
    map.addControl(drawControl);

    // Species
    speciesLayerGroup = L.featureGroup().addTo(map);

    L.Control.speciesWidget = L.Control.extend({
        position: 'topright',
        onAdd: function() {
            return speciesWidget;
        }
    });
    L.control.speciesWidget = function(opts) {
        return new L.Control.speciesWidget(opts);
    }
    L.control.speciesWidget({
        position: 'topright'
    })
    .addTo(map);

    speciesWidgetCollapse = new bootstrap.Collapse('#speciesWidgetContent', {
        toggle: false
    });

    // Desktop
    speciesWidget.addEventListener('mouseover', onWidgetOver, false);
    speciesWidget.addEventListener('mouseout', onWidgetOut, false);
    // Mobile
    speciesWidget.addEventListener('touchstart', onWidgetOver, false);
    speciesWidget.addEventListener('touchend', onWidgetOut, false);
}

async function querySpeciesByBbox() {
    const params = config.iNaturalist.params;
    params.nelat = bbox._northEast.lat;
    params.nelng = bbox._northEast.lng;
    params.swlat = bbox._southWest.lat;
    params.swlng = bbox._southWest.lng;
    params.page = page;
    params.locale = config.app.defaultLang;

    const response = await fetch(`${config.iNaturalist.apiUrl}/observations?` + new URLSearchParams(params));
    return response.json();
}

async function createSpeciesList() {
    speciesWidgetCollapse.show();

    toggleLoader(true);

    const data = await querySpeciesByBbox();
    console.log(data)

    if (data.results.length) {
        clearSpeciesMarkers();
        clearSpeciesList();

        for (const [index, item] of data.results.entries()) {
            const specieItem = createSpecieItem(item);
            speciesList.innerHTML += specieItem;

            createSpecieMarker(index, item);
        }

        totalResults = data.total_results;

        totalPages = totalResults / config.iNaturalist.params.per_page;
        if (totalPages % 1 !== 0) {
            totalPages = parseInt(totalPages) + 1;
        }

        page = data.page;

        if (totalResults > config.iNaturalist.params.per_page) {
            speciesPagination.innerHTML = createSpeciesPagination();
        }
    }
    else {
        speciesList.innerHTML = `<div class="p-3">
            <p>Nenhum resultado encontrado.</p>
            <p>Por favor, tente novamente selecionando outra área de interesse.</p>
        </div>`;
        speciesPagination.innerHTML = '';
    }

    toggleLoader(false);
}

function createSpecieMarker(index, item) {
    const latLng = item.geojson.coordinates.reverse();
    const createdAt = new Date(item.created_at).toLocaleDateString();

    let images = '';
    let countImages = 0;
    for (const [photoIndex, photo] of item.observation_photos.entries()) {
        const photoUrl = photo.photo.url.replace('square', 'large');

        images += `<div class="carousel-item ${photoIndex === 0 ? 'active' : ''}">
            <img src="${photoUrl}" class="d-block w-auto mx-auto" style="max-height: 10rem;">
        </div>`;

        countImages++;
    }

    const marker = L.marker(latLng, {
            taxon_id: item.taxon.id
        })
        .bindPopup(`<div class="card" style="width: 16rem;">
            <div class="card-img-top">
                <div id="carousel_${index}" class="carousel carousel-dark slide">
                    <div class="carousel-inner">${images}</div>
                    <button class="carousel-control-prev ${countImages <= 1 ? 'd-none' : ''}" type="button" data-bs-target="#carousel_${index}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next ${countImages <= 1 ? 'd-none' : ''}" type="button" data-bs-target="#carousel_${index}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${item.taxon.preferred_common_name}<h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">
                    ${item.description || ''}
                </h6>
                <p class="card-text">${item.place_guess}</p>
                <a href="https://www.inaturalist.org/people/${item.user.id}" target="_blank" class="card-link d-flex justify-content-between align-items-center">
                    <img class="img-thumbnail rounded" src="${item.user.icon || './src/assets/images/icon-192x192.png'}" style="height: 48px;">
                    <span class="text-wrap ms-2" style="width: 12rem;">
                        Por ${item.user.name || item.user.login}
                    </span>
                </a>
                <div class="mt-3">
                    <a href="${item.uri}" target="_blank" class="btn btn-success btn-sm text-white" role="button">iNaturalist</a>
                    <a href="https://www.wikiaves.com.br/wiki/${item.taxon.preferred_common_name}" target="_blank" class="btn btn-danger btn-sm text-white" role="button">WikiAves</a>
                </div>
            </div>
            <div class="card-footer text-body-secondary">
                Registrado em ${createdAt}
            </div>
        <div>`, {
            closeOnClick: false
        })
        .addTo(speciesLayerGroup);
}

function clearSpeciesMarkers() {
    speciesLayerGroup.clearLayers();
}

function createSpecieItem(item) {
    const photoUrl = item.observation_photos.length ? item.observation_photos[0].photo.url : './src/assets/images/icon-192x192.png';

    const specieItem = `<div>
        <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onclick="showSpecieLocation(this, ${item.taxon.id})"
        >
            <img class="img-thumbnail rounded" src="${photoUrl}" style="height: 75px;">
            <h6 class="text-wrap ms-2" style="width: 10rem;">
                ${item.taxon.preferred_common_name}
            </h6>
        </a>
    </div>`;

    return specieItem;
}

function createSpeciesPagination() {
    const pagination = `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToPreviousPage()">&laquo;</a>
        </li>
        <li class="page-item">
            <input class="form-control text-center" type="number" value="${page}" min="1" max="${totalPages}" onchange="goToPageNumber(this)">
        </li>
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goToNextPage()">&raquo;</a>
        </li>
    `;

    return pagination;
}

function clearSpeciesList() {
    speciesList.innerHTML = ''; 
}

function showSpecieLocation(target, taxonId) {
    const marker = speciesLayerGroup.getLayers().find(layer => {
        return layer.options.taxon_id === taxonId;
    });

    const items = speciesList.getElementsByClassName('list-group-item');
    for (const item of items) {
        if (item !== target) {
            item.classList.remove('active');
        }
    }

    if (!target.classList.contains('active')) {
        target.classList.add('active');

        const latLng = marker.getLatLng();
        const bounds = L.latLngBounds(latLng, latLng);
        map.fitBounds(bounds);

        setTimeout(() => {
            marker.openPopup();
        }, 500);

        if (isMobile) {
            speciesWidgetCollapse.hide();
        }
    }
    else {
        target.classList.remove('active');

        map.fitBounds(bbox);
        marker.closePopup();
    }
}

function goToPreviousPage() {
    page = parseInt(page) - 1;

    if (page >= 1 && page <= totalPages) {
        createSpeciesList();
    }
}

function goToPageNumber(target) {
    page = parseInt(target.value);

    if (page >= 1 && page <= totalPages) {
        createSpeciesList();
    }
}

function goToNextPage() {
    page = parseInt(page) + 1;

    if (page >= 1 && page <= totalPages) {
        createSpeciesList();
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
function onDrawStart(event) {
    map.closePopup();
    speciesWidgetCollapse.hide();
}

function onDrawCreated(event) {
    drawnLayerGroup.clearLayers();
    
    const layer = event.layer;

    if (event.layerType !== 'circle') {
        bbox = layer.getBounds(); 
    }
    else {
        const latLng = layer.getLatLng();
        const radius = layer.getRadius();

        bbox = latLng.toBounds(radius);
    }

    drawnLayerGroup.addLayer(layer);
    map.fitBounds(bbox);

    createSpeciesList();
}

function onWidgetOver() {
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
}

function onWidgetOut() {
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
}

init();