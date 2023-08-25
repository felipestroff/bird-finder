/**
 * URLUtils class: Provides utility methods for managing URL parameters.
 * These utilities allow for manipulation of URL parameters without causing a page reload.
 */
export default class URLUtils {
    /**
     * Constructor: Initializes the URLUtils instance.
     */
    constructor() {
        this.currentURL = new URL(window.location.href);
        this.params = this.currentURL.searchParams;
    }

    /**
     * Adds or updates a URL parameter without reloading the page.
     * If the parameter already exists, its value will be updated; otherwise, the parameter will be added.
     * @param {string} key - The parameter name to add or update.
     * @param {string} value - The value of the parameter to set.
     */
    addOrUpdateURLParameterWithoutReload(key, value) {
        if (this.params.has(key)) {
            this.params.set(key, value);
        } else {
            this.params.append(key, value);
        }
        
        history.pushState({}, '', this.currentURL.toString());
    }

    /**
     * Checks if a specific parameter exists in the current URL.
     * @param {string} paramName - The parameter name to check.
     * @return {boolean} True if the parameter exists, otherwise false.
     */
    checkParameterInURL(paramName) {
        return this.params.has(paramName);
    }

    /**
     * Retrieves the value of a specific parameter from the current URL.
     * @param {string} paramName - The parameter name to retrieve the value for.
     * @return {string|null} The value of the parameter or null if the parameter does not exist.
     */
    getURLParameterValue(paramName) {
        return this.params.get(paramName);
    }

    /**
     * Retrieves a value for the given parameter name from the URL. 
     * If the parameter is not present, it returns the provided default value.
     *
     * @param {string} paramName - The name of the parameter to retrieve.
     * @param {any} defaultValue - The value to return if the parameter isn't found in the URL.
     * @returns {any} The value from the URL or the default value.
     */
    getValueFromURLOrDefault(paramName, defaultValue) {
        if (this.checkParameterInURL(paramName)) {
            return this.getURLParameterValue(paramName);
        }
        return defaultValue;
    }

    /**
     * Removes a specific parameter from the current URL without reloading the page.
     * If the parameter exists, it will be removed; otherwise, no action will be taken.
     * @param {string} paramName - The parameter name to remove.
     */
    removeURLParameterWithoutReload(paramName) {
        if (this.params.has(paramName)) {
            this.params.delete(paramName);
            history.pushState({}, '', this.currentURL.toString());
        }
    }
}