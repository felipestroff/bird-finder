/**
 * DOMUtils class: Provides utility methods for managing and manipulating DOM elements.
 * It includes functions for handling modals and 'collapse' elements.
 */
export default class DOMUtils {
    /**
     * Constructor: Initializes the DOMUtils instance.
     */
    constructor() {}

    /**
     * Opens an image modal with a provided title and image URL.
     * If an image modal already exists, it removes the old one before creating a new one.
     *
     * @param {string} title - The title of the modal.
     * @param {string} imageUrl - The URL of the image to be displayed in the modal.
     */
    openImageModal(title, imageUrl) {
        this._removeExistingModal('#imageModal');

        const modalElement = this._createImageModalElement(title, imageUrl);
        document.body.appendChild(modalElement);

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = '18rem';
        return card;
    }

    createCarouselControls(carouselId) {
        const controlsContainer = document.createElement('div');
    
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
    
        controlsContainer.appendChild(prevButton);
        controlsContainer.appendChild(nextButton);
    
        return controlsContainer;
    }

    /**
     * Generates the thumbnail markup with a Bootstrap spinner.
     * @param {string} thumbnailSrc The source of the thumbnail.
     * @returns {string} The thumbnail markup.
     */
    generateThumbnailMarkup(thumbnailSrc) {
        return `
            <div class="thumbnail-container position-relative d-flex align-items-center justify-content-center">
                <img class="img-fluid rounded float-start d-none" src="${thumbnailSrc}">
                <div class="spinner-border text-primary spinner-position" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }

    /**
     * Sets the value of an input element.
     * @param {string} element The DOM element.
     * @param {string} value The value to set.
     * @param {string} container (opcional) - The container that input is set.
     */
    setInputValue(element, value, container) {
        const parent = container || document;
        parent.querySelector(element).value = value;
    }

    /**
     * Retrieves the value of the search input.
     * @param {string} element The DOM element.
     * @param {string} container (opcional) - The container that input is set.
     * @returns {string} The value of the search input.
     */
    getInputValue(element, container) {
        const parent = container || document;
        return parent.querySelector(element).value;
    }

    /**
     * Sets up the event handlers for the thumbnail images of the species list items.
     * @param {HTMLElement} element The DOM element representing a species list item.
     */
    setupThumbnailEventHandlers(element) {
        const thumbnailItems = element.querySelectorAll('.thumbnail-container');
        for (const thumbnailItem of thumbnailItems) {
            const img = thumbnailItem.querySelector('img');
            const spinner = thumbnailItem.querySelector('.spinner-border');
            
            img.addEventListener('load', () => {
                if (spinner) spinner.classList.add('d-none');
                img.classList.remove('d-none'); // Show the image
            });
        }
    }

    /**
     * Shows a specific collapse element by adding the 'show' class to it.
     *
     * @param {HTMLElement} collapse - The collapse element to be shown.
     */
    showCollapse(collapse) {
        if (collapse) {
            collapse.classList.add('show');
        }
    }
    
    /**
     * Hides all collapse elements present in the document by removing the 'show' class from them.
     */
    hideCollapses() {
        const collapseElements = document.querySelectorAll('.collapse');
        for (const collapseEl of collapseElements) {
            collapseEl.classList.remove('show');
        }
    }

    /**
     * Extracts the marker ID from the given target's ID.
     * 
     * @param {Element} target - The target element containing the ID in the format "prefix_id".
     * @returns {string} The extracted ID.
     */
    extractIdFromTarget(target) {
        return target.id.split('_')[1];
    }

    /**
     * Extracts the ID from the event target's options.
     * @param {Object} event - The event object.
     * @returns {string} The extracted ID.
     */
    extractIDFromEvent(event) {
        return event.target.options.id;
    }

    /**
     * Highlights and focuses the item with the given ID in the DOM.
     * @param {string} element - The element to highlight.
     */
    highlightElement(element) {
        const item = document.querySelector(element);
        if (item) {
            item.classList.add('active');
            item.focus();
        }
    }

    /**
     * Removes the highlight from the item with the given ID in the DOM.
     * @param {string} element - The element to unhighlight.
     */
    unhighlightElement(element) {
        const item = document.querySelector(element);
        if (item) {
            item.classList.remove('active');
        }
    }

    /**
     * Removes an existing modal based on the provided selector.
     *
     * @param {string} selector - The selector for the modal to be removed.
     * @private
     */
    _removeExistingModal(selector) {
        const oldModal = document.querySelector(selector);
        if (oldModal) {
            oldModal.remove();
        }
    }

    /**
     * Creates and returns a modal element for an image with the provided title and URL.
     *
     * @param {string} title - The title for the modal.
     * @param {string} imageUrl - The URL of the image to be displayed in the modal.
     * @returns {HTMLElement} - The modal element.
     * @private
     */
    _createImageModalElement(title, imageUrl) {
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
        return modalContent.firstChild;
    }
}