export default class SearchControl {
    constructor(app) {
        this.app = app;
        this.config = app.config;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.drawLayer = app.layers.draw;
        this.markersLayer = app.layers.marker;
        this.controlUtils = app.controlUtils;
        this.page = 1;
    }

    /**
     * Creates a custom control and adds it to the map.
     */
    createControl() {
        const Control = this.createControlClass();
        new Control({ position: 'topright' }).addTo(this.map);
    }

    /**
     * Creates a custom Leaflet control class for location functionalities.
     * 
     * @returns {L.Control} A Leaflet control class for location.
     */
    createControlClass() {
        return L.Control.extend({
            onAdd: () => {
                this.container = this.createControlContainer();
                this.bindControlEvents();
                return this.container;
            }
        });
    }

    /**
     * Creates a container for the location control with the necessary HTML elements.
     * 
     * @returns {HTMLElement} The location control container element.
     */
    createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this.getControlHTML();
        return container;
    }

    /**
     * Returns the HTML string for the location control's content.
     * 
     * @returns {string} The location control's HTML content.
     */
    getControlHTML() {
        return `
            <div class="d-flex justify-content-end">
                <button class="btn btn-light btn-sm border-dark-subtle" type="button" data-bs-toggle="collapse" data-bs-target="#searchContent" title="${this.langControl.translate('Search')}" aria-label="${this.langControl.translate('Search')}" aria-expanded="false" aria-controls="searchContent">
                    <img src="assets/binoculars.png" alt="Pesquisar" style="height: 2rem;">
                </button>
            </div>
            <div id="searchContent" class="control-content collapse show collapse-horizontal bg-white rounded">
                <div class="position-absolute d-grid gap-2 d-flex justify-content-start" style="left: 10px; top: 10px;">
                    <button id="setDefaultExtentBtn" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.langControl.translate('Default view')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-globe-americas" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
                        </svg>
                    </button>
                    <button id="clearFiltersButton" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.langControl.translate('Clear filters')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                    </button>
                </div>
                <form id="searchForm" class="p-2">
                    <div class="input-group">
                        <input id="searchInput" type="text" class="form-control" placeholder="${this.langControl.translate('Type here')}">
                        <button type="submit" class="input-group-text btn-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </button>
                    </div>
                </form>
                <div id="searchItems" class="list-group overflow-auto" style="max-height: 55vh;">
                    <div class="p-3">
                        <p>${this.langControl.translate('Enter above or select an area to begin your bird species search')}.</p>
                        <p>${this.langControl.translate('To do so, use the drawing tools located on the left side')}.</p>
                    </div>
                </div>
                <nav class="d-flex justify-content-center align-items-center mt-3">
                    <ul id="searchPagination" class="pagination"></ul>
                </nav>
                <div class="d-flex justify-content-center align-items-center form-text">
                    Powered by <a href="https://api.inaturalist.org/v1/docs" target="_blank" class="ms-1">iNaturalist API</a>
                </div>
            </div>
        `;
    }

    // Binds the necessary events (mouseover, mouseout, touchstart, touchend) to the location control container
    bindControlEvents() {
        L.DomEvent.on(this.container, 'mouseover touchstart', this.controlUtils.onControlOver.bind(this));
        L.DomEvent.on(this.container, 'mouseout touchend', this.controlUtils.onControlOut.bind(this));

        this.container.querySelector('#setDefaultExtentBtn').addEventListener('click', this.app.setDefaultExtent.bind(this));
        this.container.querySelector('#clearFiltersButton').addEventListener('click', this.clearFilters.bind(this));
        this.container.querySelector('#searchInput').addEventListener('change', this.onSearchInputChange.bind(this));
        this.container.querySelector('#searchForm').addEventListener('submit', this.onSearchSubmit.bind(this));
    }

    clearFilters() {
        this.app.bbox = null;
        this.app.clearAll();
        this.drawLayer.clearLayers();

        this.container.querySelector('#searchInput').value = '';
    }

    clearSearchItems() {
        document.querySelector('#searchItems').innerHTML = `<div class="p-3">
            <p>${this.langControl.translate('Enter above or select an area to begin your bird species search')}.</p>
            <p>${this.langControl.translate('To do so, use the drawing tools located on the left side')}.</p>
        </div>`;
    }

    async search() {
        const term = this.container.querySelector('#searchInput').value;
        if (term || this.app.bbox) {
            this.app.clearAll();
    
            this.app.hideCollapses();
            this.app.showCollapse(this.container.querySelector('#searchContent'));
            this.showSearchLoader();
    
            const data = await this.querySpecies(term, this.app.bbox);
            if (data) {
                this.createSpeciesList(data);
            }
        }
    }

    async querySpecies(term, bbox) {
        const params = this.config.iNaturalist.params;
        params.page = this.page;
        params.locale = this.langControl.lang;
    
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
    
        const response = await fetch(`${this.config.iNaturalist.apiUrl}/observations?` + new URLSearchParams(params));
        return response.json();
    }

    createSpeciesList(data) {
        this.page = data.page;
    
        const results = data.results;
        if (results.length) {
            let items = '';
    
            for (const item of results) {
                if (item.geojson) {
                    const specieItem = this.createListItem(item);
                    items += specieItem;
    
                    this.app.createMarker(item);
                }
            }
            this.container.querySelector('#searchItems').innerHTML = items;

            const specieItems = this.container.querySelectorAll('.specie-item');
            for (const specieItem of specieItems) {
                specieItem.addEventListener('click', () => {
                    this.app.openPopup(specieItem);
                }, false);

                const thumbnailItems = specieItem.querySelectorAll('.thumbnail-container');
                for (const thumbnailItem of thumbnailItems) {
                    const img = thumbnailItem.querySelector('img');
                    const spinner = thumbnailItem.querySelector('.spinner-border');

                    img.addEventListener('load', () => {
                        if (spinner) {
                            spinner.classList.add('d-none');
                        }
                        img.classList.remove('d-none'); // Mostrar a imagem
                    })
                }
            }
    
            const totalResults = data.total_results;
            
            let totalPages = totalResults / this.config.iNaturalist.params.per_page;
            if (totalPages % 1 !== 0) {
                totalPages = parseInt(totalPages) + 1;
            }
    
            if (totalResults > this.config.iNaturalist.params.per_page) {
                this.createPagination(totalPages);
            }
    
            const bounds = this.app.bbox || this.markersLayer.getBounds();
            this.map.fitBounds(bounds);
        }
        else {
            this.setNoResultsFound();
        }
    }

    createListItem(item) {
        let thumbnailSrc;
        if (item.observation_photos.length) {
            thumbnailSrc = item.observation_photos[0].photo.url;
        }
        else {
            thumbnailSrc = './assets/sound.png';
        }
        
        // Thumbnail markup with Bootstrap spinner
        const thumbnail = `
            <div class="thumbnail-container position-relative">
                <img class="img-fluid rounded float-start d-none" src="${thumbnailSrc}">
                <div class="spinner-border text-primary spinner-position" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

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
            name = this.langControl.translate('Unnamed');
        }

        const specieItem = `
            <div>
                <a href="#" id="item_${item.id}" class="specie-item list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div class="ms-2 me-auto">    
                        ${thumbnail}
                    </div>
                    <h6 class="text-wrap ms-2" style="width: 12rem;">
                        ${name}
                        <br/>
                        <small class="text-body-secondary">(${item.taxon.name})</small>
                    </h6>
                </a>
            </div>
        `;

        return specieItem;
    }

    createPagination(totalPages) {
        this.container.querySelector('#searchPagination').innerHTML = `
            <li class="page-item ${this.page === 1 ? 'disabled' : ''}">
                <a id="previousPage" class="page-link" href="#" onclick="paginate(${this.page - 1}, ${totalPages})">&laquo;</a>
            </li>
            <li class="page-item">
                <input id="goToPage" class="form-control text-center" type="number" value="${this.page}" min="1" max="${totalPages}">
            </li>
            <li class="page-item ${this.page === totalPages ? 'disabled' : ''}">
                <a id="nextPage" class="page-link" href="#">&raquo;</a>
            </li>
        `;

        this.container.querySelector('#previousPage').addEventListener('click', (event) => {
            this.paginate(this.page - 1, totalPages);
        });
        this.container.querySelector('#goToPage').addEventListener('change', (event) => {
            this.paginate(event.target.value, totalPages);
        });
        this.container.querySelector('#nextPage').addEventListener('click', (event) => {
            this.paginate(this.page + 1, totalPages);
        });
    }

    paginate(pageNumber, totalPages) {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            this.page = pageNumber;
            
            this.search();
        }
    }

    setNoResultsFound() {
        this.container.querySelector('#searchItems').innerHTML = `<div class="p-3">
            <p>${this.langControl.translate('No results found')}.</p>
            <p>${this.langControl.translate('Please try again with other filters')}.</p>
        </div>`;
    
        this.clearPagination();
    }

    clearPagination() {
        this.container.querySelector('#searchPagination').innerHTML = '';
    }

    showSearchLoader() {
        document.querySelector('#searchItems').innerHTML = `
            <div class="p-3 text-center">
                <p>${this.langControl.translate('Loading...')}.</p>
            </div>
        `;
    }

    onSearchInputChange() {
        this.page = 1;
    }

    onSearchSubmit(event) {
        event.preventDefault();
    
        this.search();
    }
}