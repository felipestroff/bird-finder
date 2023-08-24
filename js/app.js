import ControlUtils from './utils/controlUtils.js';
import LangControl from './controls/langControl.js';
import HelpControl from './controls/helpControl.js';
import LocationControl from './controls/locationControl.js';
import DrawControl from './controls/drawControl.js';
import LayersControl from './controls/layersControl.js';
import SearchControl from './controls/searchControl.js';

export default class App {
    constructor(config) {
        this.config = config;
        this.layers = {};
        this.controls = {};
        this.bbox = null;
        this.controlUtils = new ControlUtils(this.map);
    }

    createApp() {
        this.map = L.map('map', {
            minZoom: this.config.map.minZoom,
            maxZoom: this.config.map.maxZoom
        })
        .setView(this.config.map.latLng, this.config.map.zoom);

        if (!this.config.map.zoomControl) {
            this.map.removeControl(this.map.zoomControl);
        }

        this.createLayers();
        this.bindMapEvents();
    }

    createLayers() {
        this.layers.draw = L.featureGroup().addTo(this.map);
        this.layers.marker = L.markerClusterGroup().addTo(this.map);
        this.layers.base = {
            'OSM': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                //maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            'Satellite': L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${this.config.app.mapBox_token}`, {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                //maxZoom: 18,
                id: 'mapbox/satellite-v9',
                tileSize: 512,
                zoomOffset: -1
            })
        }

        const defaultBaseLayer = this.layers.base[this.config.map.defaultLayer];
        if (defaultBaseLayer) {
            defaultBaseLayer.addTo(this.map);
        }
    }

    // Binds the necessary events to the MapView.
    bindMapEvents() {
        this.map.onMapReady = this.onMapReady();
        this.map.on('locationfound', this.onLocationFound.bind(this));
        this.map.on('draw:drawstart', this.onDrawStart.bind(this));
        this.map.on('draw:created', this.onDrawCreated.bind(this));
        this.map.on('draw:deleted', this.onDrawDeleted.bind(this));
    }

    setDefaultExtent() {
        this.map.setView(this.config.map.latLng, this.config.map.zoom);
    }

    clearAll() {
        this.controls.searchControl.clearSearchItems();
        this.controls.searchControl.clearPagination();
        this.clearMarkers();
    }

    clearMarkers() {
        this.layers.marker.clearLayers();
    }

    showCollapse(collapse) {
        collapse.classList.add('show');
    }
    
    hideCollapses() {
        const collapseElements = document.querySelectorAll('.collapse');
        for (const collapseEl of collapseElements) {
            collapseEl.classList.remove('show');
        }
    }

    createMarker(item) {
        const latLng = item.geojson.coordinates.reverse();
        const popupContent = this.setPopupContent(item);
    
        let photo = '';
        if (item.observation_photos && item.observation_photos.length) {
            const photoUrl = item.observation_photos[0].photo.url;
            photo = `<img src="${photoUrl}" />`;
        }
    
        const marker = L.marker(latLng, {
            id: item.id
        })
        .bindPopup(popupContent, {
            closeOnClick: false,
            closeOnEscapeKey: false
        })
        .addTo(this.layers.marker);
    
        if (!this.controlUtils.isMobile) {
            marker.bindTooltip(`
                <div class="d-flex flex-column align-items-center">
                    <div>${item.taxon.preferred_common_name}</div>
                    ${photo}
                </div>
            `)
            .addTo(this.layers.marker)
        }
    
        marker.on('popupopen', this.onPopupOpen.bind(this));
        marker.on('popupclose', this.onPopupClose.bind(this));
    }

    setPopupContent(item) {
        const lang = this.controls.langControl.lang;
        const createdAt = new Date(item.created_at).toLocaleDateString(lang);
        const carouselId = `carousel_${item.id}`;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = '18rem';

        const cardImgTop = document.createElement('div');
        cardImgTop.className = 'card-img-top';

        const carousel = document.createElement('div');
        carousel.id = carouselId;
        carousel.className = 'carousel carousel-dark slide';

        const carouselInner = document.createElement('div');
        carouselInner.className = 'carousel-inner';

        // Images
        const photos = item.observation_photos;
        if (photos && photos.length) {
            for (const [photoIndex, photoItem] of photos.entries()) {
                const photoUrl = photoItem.photo.url.replace('square', 'large');

                const itemImg = document.createElement('img');
                itemImg.src = photoUrl;
                itemImg.className = 'd-block w-auto mx-auto';
                itemImg.style.maxHeight = '10rem';

                const itemAction = document.createElement('a');
                itemAction.href = '#';
                itemAction.addEventListener('click', (e) => {
                    this.openImageModal(item.taxon.preferred_common_name, photoUrl);
                }, false);
                itemAction.appendChild(itemImg);

                const itemContent = document.createElement('div');
                itemContent.className = `carousel-item ${photoIndex === 0 ? 'active' : ''}`;
                itemContent.appendChild(itemAction);

                carouselInner.appendChild(itemContent);
            }
        }

        // Sounds
        const sounds = item.observation_sounds;
        if (sounds && sounds.length) {
            for (const [soundIndex, soundItem] of sounds.entries()) {
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

                carouselInner.appendChild(soundContent);
            }
        }

        // Carousel Controls
        const countItems = ((photos && Array.isArray(photos) && photos.length) || 0) + ((sounds && Array.isArray(sounds) && sounds.length) || 0);
        if (countItems > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'carousel-control-prev';
            prevButton.setAttribute('data-bs-target', `#${carouselId}`);
            prevButton.setAttribute('data-bs-slide', 'prev');

            const prevIcon = document.createElement('span');
            prevIcon.className = 'carousel-control-prev-icon';
            prevIcon.setAttribute('aria-hidden', 'true');
            prevButton.appendChild(prevIcon);

            const nextButton = document.createElement('button');
            nextButton.className = 'carousel-control-next';
            nextButton.setAttribute('data-bs-target', `#${carouselId}`);
            nextButton.setAttribute('data-bs-slide', 'next');

            const nextIcon = document.createElement('span');
            nextIcon.className = 'carousel-control-next-icon';
            nextIcon.setAttribute('aria-hidden', 'true');
            nextButton.appendChild(nextIcon);

            carousel.appendChild(prevButton);
            carousel.appendChild(nextButton);
        }

        carousel.appendChild(carouselInner);
        cardImgTop.appendChild(carousel);
        card.appendChild(cardImgTop);

        // Card Body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h6');
        cardTitle.className = 'card-title';
        cardTitle.textContent = item.taxon.preferred_common_name;

        const taxonName = document.createElement('small');
        taxonName.className = 'text-body-secondary';
        taxonName.textContent = `(${item.taxon.name})`;
        cardTitle.appendChild(document.createElement('br'));
        cardTitle.appendChild(taxonName);
        cardBody.appendChild(cardTitle);

        if (item.description) {
            const popupDescription = document.createElement('div');
            popupDescription.className = 'popup-description overflow-auto pt-2';
            
            const cardSubtitle = document.createElement('h6');
            cardSubtitle.className = 'card-subtitle mb-2 text-body-secondary';
            cardSubtitle.textContent = item.description;

            popupDescription.appendChild(cardSubtitle);
            cardBody.appendChild(popupDescription);
        }

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = item.place_guess;
        cardBody.appendChild(cardText);

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

        cardBody.appendChild(userLink);

        const linkContainer = document.createElement('div');
        linkContainer.className = 'mt-3';

        const inatLink = document.createElement('a');
        inatLink.href = item.uri;
        inatLink.target = "_blank";
        inatLink.className = 'btn btn-success btn-sm text-white me-2';
        inatLink.textContent = 'iNaturalist';
        linkContainer.appendChild(inatLink);

        if (lang === 'pt-BR') {
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
            allaboutbirdsLink.className = 'btn btn-light btn-sm text-dark';
            allaboutbirdsLink.textContent = 'All About Birds';
            linkContainer.appendChild(allaboutbirdsLink);
        }

        cardBody.appendChild(linkContainer);

        card.appendChild(cardBody);

        // Card Footer
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer text-body-secondary';
        cardFooter.textContent = `${this.controls.langControl.translate('Registered in')} ${createdAt}`;

        card.appendChild(cardFooter);

        return card;
    }

    openPopup(target) {
        const id = target.id.split('_')[1];
        
        const marker = this.layers.marker.getLayers().find(layer => {
            return layer.options.id == id;
        });
    
        let bounds;
        
        if (!target.classList.contains('active')) {
            const latLng = marker.getLatLng();
            bounds = L.latLngBounds(latLng, latLng);
    
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
    
            if (this.controlUtils.isMobile) {
                this.hideCollapses();
            }
        }
        else {
            marker.closePopup();
    
            bounds = this.bbox || this.layers.marker.getBounds();
        }
    
        this.map.fitBounds(bounds);
    }

    openImageModal(title, imageUrl) {
        const oldModal = document.querySelector('#imageModal');
        if (oldModal) {
            oldModal.remove();
        }
    
        const modalContentHtml = `<div id="imageModal" class="modal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <img class="img-fluid" src="${imageUrl}" />
                    </div>
                </div>
            </div>
        </div>`;
    
        const modalContent = document.createElement('div');
        modalContent.innerHTML = modalContentHtml;
    
        const modalElement = modalContent.firstChild;
        document.body.appendChild(modalElement);
    
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    async onMapReady() {
        this.controls.langControl = new LangControl(this);
        await this.controls.langControl.setLang();
        this.controls.langControl.createControl();

        this.controls.helpControl = new HelpControl(this);
        this.controls.helpControl.createControl();

        this.controls.locationControl = new LocationControl(this);
        this.controls.locationControl.createControl();

        this.controls.drawControl = new DrawControl(this);
        this.controls.drawControl.createControl();

        this.controls.layersControl = new LayersControl(this);
        this.controls.layersControl.createControl()

        this.controls.searchControl = new SearchControl(this);
        this.controls.searchControl.createControl();
    }

    onLocationFound(event) {
        const latLng = event.latlng;

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
    
        const radiusInKm = parseInt(document.querySelector('#bufferRangeInput').value);
        const radiusInM = radiusInKm * 1000;
        const circle = L.circle(latLng, {
            radius: radiusInM
        })
        .addTo(this.layers.draw);
    
        this.bbox = circle.getBounds();
    
        this.map.fitBounds(this.bbox);
    
        this.controls.searchControl.search();
    }

    onDrawStart(event) {
        this.map.closePopup();
    
        this.hideCollapses();
    }
    
    onDrawCreated(event) {
        this.controls.searchControl.page = 1;
    
        this.layers.draw.clearLayers();
        
        const layer = event.layer;
    
        if (event.layerType !== 'circle') {
            this.bbox = layer.getBounds(); 
        }
        else {
            const latLng = layer.getLatLng();
            const radius = layer.getRadius();
    
            this.bbox = latLng.toBounds(radius);
        }
    
        this.layers.draw.addLayer(layer);
    
        this.controls.searchControl.search();
    }
    
    onDrawDeleted(event) {
        this.bbox = null;
    
        this.clearAll();
    
        this.controls.searchControl.toggleSearchLoader(false);
    }

    onPopupOpen(event) {
        const popup = event.popup;
        const id = event.target.options.id;
        const item = document.querySelector(`#item_${id}`);
        item.classList.add('active');
        item.focus();
    
        const latLng = popup.getLatLng();
        const newLat = latLng.lat + 0.0010;
        const newLatLng = [newLat, latLng.lng];
    
        this.map.setView(newLatLng);
    }

    onPopupClose(event) {
        const id = event.target.options.id;
        const item = document.querySelector(`#item_${id}`);
        if (item) {
            item.classList.remove('active');
        }
    }
}