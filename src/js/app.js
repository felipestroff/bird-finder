// Global variables
let bbox;
let totalPages = 1;
let page = 1;
let totalResults = 0;
let results = [];

const map = L.map('map').setView([-29.9436224, -51.2138659], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
.addTo(map);

const drawnLayerGroup = L.featureGroup().addTo(map);
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

map.on(L.Draw.Event.CREATED, onDrawCreated);

const speciesLayerGroup = L.featureGroup().addTo(map);

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

speciesWidget.addEventListener('mouseover', onWidgetMouseOver, false);
speciesWidget.addEventListener('mouseout', onWidgetMouseOut, false);

// Methods
async function querySpeciesByBbox() {
    const params = {
        nelat: bbox._northEast.lat,
        nelng: bbox._northEast.lng,
        swlat: bbox._southWest.lat,
        swlng: bbox._southWest.lng,
        taxon_id: 3, // 3: Aves
        verifiable: true,
        page: page
    };

    const response = await fetch('https://api.inaturalist.org/v1/observations?' + new URLSearchParams(params));
    return response.json();
}

async function createSpeciesList() {
    toggleLoader(true);

    const data = await querySpeciesByBbox();

    console.log(data);

    if (data.results.length) {
        clearSpeciesMarkers();
        clearSpeciesList();
        
        results = data.results.filter((obj, index, self) => {
            return index === self.findIndex((t) => t.community_taxon_id === obj.community_taxon_id)
        });

        for (const [index, specie] of results.entries()) {
            const specieItem = createSpecieItem(index, specie);
            speciesList.innerHTML += specieItem;

            createSpecieMarker(index, specie);
        }

        totalResults = data.total_results;

        totalPages = totalResults / 30;
        if (totalPages % 1 !== 0) {
            totalPages = parseInt(totalPages) + 1;
        }

        page = data.page;

        if (totalResults > 30) {
            speciesPagination.innerHTML = createSpeciesPagination();
        }
    }
    else {
        alert('Nenhuma espécie encontrada nesta região!');
    }

    toggleLoader(false);
}

function createSpecieMarker(index, specie) {
    const latLng = specie.geojson.coordinates.reverse();
    const title = specie.species_guess || specie.description;

    let images = '';
    let countImages = 0;
    for (const [photoIndex, photo] of specie.observation_photos.entries()) {
        const photoUrl = photo.photo.url.replace('square', 'large');

        images += `<div class="carousel-item ${photoIndex === 0 ? 'active' : ''}">
            <img src="${photoUrl}" class="d-block w-100">
        </div>`;

        countImages++;
    }

    const marker = L.marker(latLng)
        .addTo(speciesLayerGroup)
        .bindPopup(`<div class="card" style="width: 18rem;">
            <div id="carousel_${index}" class="card-img-top carousel slide">
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
            <div class="card-body">
                <h5 class="card-title">${title}<h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">
                    ${specie.description || ''}
                </h6>
                <p class="card-text">${specie.place_guess}</p>
                <a href="https://www.inaturalist.org/people/${specie.user.id}" target="_blank" class="card-link d-flex justify-content-between align-items-center">
                    <img class="img-thumbnail rounded" src="${specie.user.icon || './src/assets/images/icon-192x192.png'}" style="height: 48px;">
                    <span class="text-wrap ms-2" style="width: 10rem;">
                        Registro feito por ${specie.user.name || specie.user.login}
                    </span>
                </a>
            </div>
        <div>`);
}

function clearSpeciesMarkers() {
    speciesLayerGroup.clearLayers();
}

function createSpecieItem(index, specie) {
    const id = `collapse_${index}`;
    const photoUrl = specie.observation_photos.length ? specie.observation_photos[0].photo.url : './src/assets/images/icon-192x192.png';

    const item = `<div>
        <a href="#${id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
        >
            <img class="img-thumbnail rounded" src="${photoUrl}" style="height: 75px;">
            <h6 class="text-wrap ms-2" style="width: 10rem;">
                ${specie.species_guess || specie.description}
            </h6>
        </a>
        <div id="${id}" class="collapse">
            <div class="card card-body">
                <a class="card-link" href="#" onclick="showSpecieLocation([${specie.geojson.coordinates}])">Ver no mapa</a>
            </div>
        </div>
    </div>`;

    return item;
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

function showSpecieLocation(coordinates) {
    const latLng = coordinates.reverse();
    const bounds = L.latLngBounds(latLng, latLng);

    map.fitBounds(bounds);
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

function onWidgetMouseOver() {
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
}

function onWidgetMouseOut() {
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
}