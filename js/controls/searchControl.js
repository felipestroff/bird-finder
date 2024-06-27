/**
 * Class representing a search control.
 */
export default class SearchControl {
    /**
     * Constructs an instance responsible for search controls and behaviors in the map application.
     *
     * @param {Object} app - The main application object containing configurations, utility methods, and state.
     */
    constructor(app) {
        // Assign properties from the application object
        this._initializeProperties(app);

        // Set the page number either from the URL or default to 1
        this.page = this.urlUtils.getValueFromURLOrDefault('page', 1);

        // Set the number of items per page either from the URL or from the default configuration
        this.per_page = this.urlUtils.getValueFromURLOrDefault('per_page', this.config.params.per_page);
    }

    /**
     * Initializes properties using values from the given application object.
     *
     * @param {Object} app - The main application object.
     * @private
     */
    _initializeProperties(app) {
        this.app = app;
        this.config = app.config.iNaturalist;
        this.map = app.map;
        this.langControl = app.controls.langControl;
        this.drawLayer = app.layers.draw;
        this.markersLayer = app.layers.marker;
        this.urlUtils = app.urlUtils;
        this.mapUtils = app.mapUtils;
        this.domUtils = app.domUtils;
    }

    /**
     * Creates a custom control and adds it to the map.
     * Initializes search if a query parameter 'q' is present in the URL.
     */
    createControl() {
        const Control = this._createControlClass();
        new Control({ position: 'topright' }).addTo(this.map);

        if (this.urlUtils.checkParameterInURL('q')) {
            const query = this.urlUtils.getURLParameterValue('q');
            this.search(query);
        }
    }

    /**
     * Creates a custom Leaflet control class for location functionalities.
     * @returns {L.Control} A Leaflet control class for location.
     * @private
     */
    _createControlClass() {
        return L.Control.extend({
            onAdd: () => {
                this.container = this._createControlContainer();
                this._bindControlEvents();
                return this.container;
            }
        });
    }

    /**
     * Creates a container for the location control with the necessary HTML elements.
     * @returns {HTMLElement} The location control container element.
     * @private
     */
    _createControlContainer() {
        const container = L.DomUtil.create('div', 'control leaflet-control');
        container.innerHTML = this._getControlHTML();
        return container;
    }

    /**
     * Generates the HTML content for the location control.
     * @returns {string} The location control's HTML content.
     * @private
     */
    _getControlHTML() {
        return `
            <div class="d-flex justify-content-end">
                <button class="btn btn-light btn-sm border-dark-subtle" type="button" data-bs-toggle="collapse" data-bs-target="#searchContent" title="${this.langControl.translate('Search')}" aria-label="${this.langControl.translate('Search')}" aria-expanded="false" aria-controls="searchContent">
                    <img src="assets/binoculars.png" alt="Pesquisar" width="32" height="32">
                </button>
            </div>
            <div id="searchContent" class="control-content collapse collapse-horizontal bg-white rounded">
                <div class="position-absolute d-grid gap-2 d-flex justify-content-start" style="left: 10px; top: 10px;">
                    <button id="setDefaultExtentBtn" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.langControl.translate('Default view')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-globe-americas" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
                        </svg>
                    </button>
                    <button id="clearFiltersButton" class="btn btn-light btn-sm border-dark-subtle" type="button" title="${this.langControl.translate('Clear filters')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <form id="searchForm" class="p-2">
                    <div class="input-group">
                        <input id="searchInput" type="text" class="form-control" placeholder="${this.langControl.translate('Type here')}">
                        <button type="submit" class="input-group-text btn-link" aria-label="${this.langControl.translate("Search")}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </button>
                    </div>
                </form>
                <div id="searchItems" class="list-group overflow-auto" style="max-height: 50vh;">
                    <div class="p-3">
                        <p>${this.langControl.translate('Enter above or select an area to begin your bird species search')}.</p>
                        <p>${this.langControl.translate('To do so, use the drawing tools located on the left side')}.</p>
                    </div>
                </div>
                <div id="searchPagination" class="d-row justify-content-center align-items-center mt-3"></div>
            </div>
        `;
    }

    /**
     * Binds events to the location control container for interaction.
     * @private
     */
    _bindControlEvents() {
        L.DomEvent.on(this.container, 'mouseover touchstart', this.mapUtils.onControlOver.bind(this.mapUtils));
        L.DomEvent.on(this.container, 'mouseout touchend', this.mapUtils.onControlOut.bind(this.mapUtils));

        this.container.querySelector('#setDefaultExtentBtn').addEventListener('click', this.mapUtils.setDefaultExtent.bind(this.mapUtils));
        this.container.querySelector('#clearFiltersButton').addEventListener('click', this._clearFilters.bind(this));
        this.container.querySelector('#searchInput').addEventListener('change', this.resetSearchPage.bind(this));
        this.container.querySelector('#searchForm').addEventListener('submit', this._onSearchSubmit.bind(this));
    }

    /**
     * Clears the applied filters and resets the application to its initial state.
     * @private
     */
    _clearFilters() {
        this._resetAppFilters();
        this.domUtils.setInputValue('#searchInput', '', this.container);
        this._removeURLParameters();
    }

    /**
     * Resets the bounding box and clears all associated application filters.
     * @private
     */
    _resetAppFilters() {
        this.app.bbox = null;
        this.app.clearAll();
        this.app.clearDrawLayers();
    }

    /**
     * Removes specific parameters from the current URL without reloading the page.
     * @private
     */
    _removeURLParameters() {
        const parametersToRemove = ['q', 'page', 'per_page'];
        parametersToRemove.forEach(param => this.urlUtils.removeURLParameterWithoutReload(param));
    }

    /**
     * Clears the search items display.
     */
    clearSearchItems() {
        this.container.querySelector('#searchItems').innerHTML = `<div class="p-3">
            <p>${this.langControl.translate('Enter above or select an area to begin your bird species search')}.</p>
            <p>${this.langControl.translate('To do so, use the drawing tools located on the left side')}.</p>
        </div>`;
    }

    /**
     * Prepares the environment for a search operation.
     * @private
     */
    _prepareForSearch() {
        this.app.clearAll();
        this.domUtils.hideCollapses();
        this.domUtils.showCollapse(this.container.querySelector('#searchContent'));
        this._showSearchLoader();
    }

    /**
     * Updates the URL with necessary parameters based on the search results and provided term.
     * @private
     * @param {object} data The search result data.
     * @param {string} term The search term.
     */
    _updateURLParameters(data, term) {
        if (term) {
            this.urlUtils.addOrUpdateURLParameterWithoutReload('q', term);
        }
        if (data.page) {
            this.page = data.page;
            this.urlUtils.addOrUpdateURLParameterWithoutReload('page', this.page);
        }
        if (data.per_page) {
            this.per_page = data.per_page;
            this.urlUtils.addOrUpdateURLParameterWithoutReload('per_page', this.per_page);
        }
    }

    /**
     * Performs a search operation based on a query or the current value of the search input.
     * @param {string} query The query string to search for.
     */
    async search(query) {
        const term = query || this.domUtils.getInputValue('#searchInput', this.container);
        if (term || this.app.bbox) {
            this.domUtils.setInputValue('#searchInput', term, this.container);
            this._prepareForSearch();
            const data = await this._querySpecies(term, this.app.bbox);
            
            if (data) {
                this._updateURLParameters(data, term);
                this._createSpeciesList(data);
            }
        }
    }

    /**
     * Sends a request to the iNaturalist API and fetches species data based on search parameters.
     * @param {string} term The search term.
     * @param {Object} bbox The bounding box for search.
     * @returns {Object} The response data.
     * @private
     */
    async _querySpecies(term, bbox) {
        const params = this._prepareSearchParams(term, bbox);
        
        const response = await fetch(`${this.config.apiUrl}/observations?` + new URLSearchParams(params));
        return response.json();
    }

    /**
     * Prepares search parameters for the iNaturalist API request.
     * @param {string} term The search term.
     * @param {Object} bbox The bounding box for search.
     * @returns {Object} The prepared parameters.
     * @private
     */
    _prepareSearchParams(term, bbox) {
        this.config.params.per_page = this.per_page;

        const params = {...this.config.params};
        params.page = this.page;
        params.locale = this.langControl.lang.replace('_', '-');

        if (term) {
            params.q = term;
        }
        else {
            delete params.q;
        }

        this._setBoundingBoxParams(params, bbox);

        return params;
    }

    /**
     * Updates the provided search parameters with bounding box values or removes them if not provided.
     * @param {Object} params The parameters to update.
     * @param {Object} bbox The bounding box for search.
     * @private
     */
    _setBoundingBoxParams(params, bbox) {
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
    }

    /**
     * Creates and displays a list of species based on the fetched data.
     * @param {Object} data The fetched data from the iNaturalist API.
     * @private
     */
    _createSpeciesList(data) {
        const results = data.results;
        if (results.length) {
            this._populateSpeciesList(results);
            this._setupListEventHandlers();
            this._handlePagination(data.total_results);
            this.mapUtils.fitMapBounds(this.app.bbox || this.markersLayer.getBounds());
        }
        else {
            this._setNoResultsFound();
        }
    }

    /**
     * Populates the species list container with the given species results.
     * @param {Array} results The list of species results.
     * @private
     */
    _populateSpeciesList(results) {
        let items = '';
        for (const item of results) {
            if (item.geojson) {
                items += this._createListItem(item);
                this.app.createMarker(item);
            }
        }
        this.container.querySelector('#searchItems').innerHTML = items;
    }

    /**
     * Sets up the event handlers for each species list item.
     * @private
     */
    _setupListEventHandlers() {
        const specieItems = this.container.querySelectorAll('.specie-item');
        for (const specieItem of specieItems) {
            specieItem.addEventListener('click', () => {
                this.app.openPopup(specieItem);
            });

            this.domUtils.setupThumbnailEventHandlers(specieItem);
        }
    }

    /**
     * Creates the pagination controls and updates the display based on the number of total results.
     * @param {number} totalResults The total number of results.
     * @private
     */
    _handlePagination(totalResults) {
        let totalPages = Math.ceil(totalResults / this.per_page);
        if (totalResults > this.per_page) {
            this._createPagination(totalPages, totalResults);
        }
    }

    /**
     * Generates the HTML for a list item representing a species.
     * @param {Object} item The data of the species.
     * @returns {string} The HTML string for the species list item.
     * @private
     */
    _createListItem(item) {
        const thumbnailSrc = this.getThumbnailSource(item);
        const thumbnailMarkup = this.domUtils.generateThumbnailMarkup(thumbnailSrc);
        const speciesName = this.getSpeciesName(item);
        
        return `
            <div>
                <a href="#" id="item_${item.id}" class="specie-item list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div class="ms-2 me-auto">${thumbnailMarkup}</div>
                    <h6 class="text-wrap ms-2" style="width: 12rem;">
                        ${speciesName}
                        <br/>
                        <small class="text-body-secondary">(${item.taxon.name})</small>
                    </h6>
                </a>
            </div>
        `;
    }

    /**
     * Returns the source of the thumbnail based on the species data.
     * @param {Object} item The data of the species.
     * @returns {string} The source of the thumbnail.
     */
    getThumbnailSource(item) {
        return item.observation_photos.length 
            ? item.observation_photos[0].photo.url 
            : './assets/sound.png';
    }

    /**
     * Determines the name of the species based on available data.
     * @param {Object} item The data of the species.
     * @returns {string} The name of the species.
     */
    getSpeciesName(item) {
        if (item.taxon.preferred_common_name) {
            return item.taxon.preferred_common_name;
        }
        else if (item.taxon.english_common_name) {
            return item.taxon.english_common_name;
        }
        else if (item.species_guess) {
            return item.species_guess;
        }
        else {
            return this.langControl.translate('Unnamed');
        }
    }

    /**
     * Creates and populates the pagination controls based on the total pages and results.
     * @param {number} totalPages - The total number of pages.
     * @param {number} totalResults - The total number of results.
     * @private
     */
    _createPagination(totalPages, totalResults) {
        const perPageOptionsMarkup = this._generatePerPageOptionsMarkup();
        const paginationMarkup = this._generatePaginationMarkup(totalPages, totalResults, perPageOptionsMarkup);

        this.populatePaginationContainer(paginationMarkup);
        this._attachPaginationEventListeners(totalPages);
    }

    /**
     * Generates the per page options markup for the dropdown.
     * @returns {string} - The generated markup for per page options.
     * @private
     */
    _generatePerPageOptionsMarkup() {
        return this.config.per_page_options.map(per_pageOption => `
            <li>
                <a class="per-page dropdown-item ${this.per_page === per_pageOption ? 'active' : ''}" href="#">
                    ${per_pageOption}
                </a>
            </li>
        `)
        .join('');
    }

    /**
     * Generates the full pagination markup using the provided data.
     * @param {number} totalPages - The total number of pages.
     * @param {number} totalResults - The total number of results.
     * @param {string} perPageOptionsMarkup - The markup for per page options.
     * @returns {string} - The generated pagination markup.
     * @private
     */
    _generatePaginationMarkup(totalPages, totalResults, perPageOptionsMarkup) {
        return `
            <div class="text-center">
                ${this.langControl.translate('Showing')}
                <div class="btn-group dropup">
                    <button type="button" class="btn btn-light btn-sm dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        ${this.per_page * this.page}
                    </button>
                    <ul class="dropdown-menu">
                        <li><h6 class="dropdown-header">${this.langControl.translate('Records per page')}</h6></li>
                        ${perPageOptionsMarkup}
                    </ul>
                </div>
                ${this.langControl.translate('of')} ${totalResults} ${this.langControl.translate('records')}
            </div>
            <div class="d-flex justify-content-center mt-2">
                <ul class="pagination">
                    <li class="page-item ${this.page === 1 ? 'disabled' : ''}">
                        <a id="previousPage" class="page-link" href="#">&laquo;</a>
                    </li>
                    <li class="page-item">
                        <input id="goToPage" class="form-control text-center" type="number" value="${this.page}" min="1" max="${totalPages}">
                    </li>
                    <li class="page-item ${this.page === totalPages ? 'disabled' : ''}">
                        <a id="nextPage" class="page-link" href="#">&raquo;</a>
                    </li>
                </ul>
            </div>
        `;
    }

    /**
     * Populates the pagination container with the provided markup.
     * @param {string} paginationMarkup - The generated pagination markup.
     */
    populatePaginationContainer(paginationMarkup) {
        this.container.querySelector('#searchPagination').innerHTML = paginationMarkup;
    }

    /**
     * Attaches event listeners to the pagination controls.
     * @param {number} totalPages - The total number of pages.
     * @private
     */
    _attachPaginationEventListeners(totalPages) {
        const per_pageActions = this.container.querySelectorAll('.per-page');
        per_pageActions.forEach(per_pageAction => {
            per_pageAction.addEventListener('click', (event) => {
                this.per_page = parseInt(event.target.innerText);
                this.search();
            });
        });

        this.container.querySelector('#previousPage').addEventListener('click', () => {
            this._paginate(this.page - 1, totalPages);
        });
        this.container.querySelector('#goToPage').addEventListener('change', (event) => {
            this._paginate(parseInt(event.target.value, 10), totalPages);
        });
        this.container.querySelector('#nextPage').addEventListener('click', () => {
            this._paginate(this.page + 1, totalPages);
        });
    }

    /**
     * Navigates to a specific page and triggers a new search based on the provided page number.
     * The function ensures that the page number is within valid range.
     *
     * @param {number} pageNumber - The page number to navigate to.
     * @param {number} totalPages - The total number of available pages.
     * @private
     */
    _paginate(pageNumber, totalPages) {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            this.page = pageNumber;
            this.search();
        }
    }

    _setNoResultsFound() {
        this.populatePaginationContainer('');
        
        this.container.querySelector('#searchItems').innerHTML = `<div class="p-3">
            <p>${this.langControl.translate('No results found')}.</p>
            <p>${this.langControl.translate('Please try again with other filters')}.</p>
        </div>`;
    }

    resetSearchPage() {
        this.page = 1;
    }

    _showSearchLoader() {
        this.container.querySelector('#searchItems').innerHTML = `
            <div class="p-3 text-center">
                <p>${this.langControl.translate('Loading...')}.</p>
            </div>
        `;
    }

    _onSearchSubmit(event) {
        event.preventDefault();
    
        this.search();
    }
}