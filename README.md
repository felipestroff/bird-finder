# Bird Finder - GIS Application for Bird Species Identification

A GIS progressive web application (PWA) leveraging the iNaturalist API to offer users greater flexibility in identifying bird species in their regions through the use of various filters, including geometric ones.

Designed for birdwatching enthusiasts, ornithologists, and nature lovers, the primary goal of this application is to facilitate quick and accurate bird species identification using diverse data such as locations, scientific and popular names, and specific areas of interest.

## Technologies

- JavaScript
- HTML5
- CSS3
- [https://leafletjs.com] Leaflet
- [https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html] Leaflet Draw
- [https://github.com/Leaflet/Leaflet.markercluster] Leaflet.markercluster
- [https://getbootstrap.com] Bootstrap

## Installation

To install and configure WebGIS, follow the steps below:

1. Clone the repository to your local machine.
2. **Using a local server (such as XAMPP, WampServer, IIS):**
   - Copy the project folder to your server's project directory (e.g. `htdocs` for XAMPP).
   - Start the server and access the project through the browser using the corresponding URL (e.g. `http://localhost/bird-finder`).
3. **Using the Visual Studio Code Live Server plugin:**
   - Open the project in Visual Studio Code.
   - Install the "Live Server" plugin if you don't already have it.
   - Right click on the `index.html` file and select "Open with Live Server". This will start a local server and open the project in your default browser.
4. **Performing deployment via Heroku:**
   - [https://www.heroku.com] Log in to your Heroku account.
   - Click on the `New` button and then on the `Create new app` item.
   - Give the app a name in the `App name` field.
   - Click on the `Create app` button.
   - With the application created, click on the `Deploy` tab.
   - In `Deployment method` select `GitHub`.
   - In `App connected to GitHub` connect with your GitHub account.
   - After connecting and giving the necessary permissions, search for the application repository on GitHub and click `Connect`.
   - To enable automatic deployments, go to `Automatic deploys` and enable deployment on the desired branch.
   - Make the first deployment of the application in `Manual deploy`, selecting the branch and then clicking on the `Deploy Branch` button.

## Directory Structure

### assets

This directory stores all static resources such as images, icons, and fonts utilized in the project.

### config

This section contains the project configuration files.

### css

Here, you'll find the project style files organized following the BEM methodology or another methodology of your choice.

### js

This directory houses all the JavaScript scripts and the core business logic of the project.

#### main.js

Serves as the application entry point. It initializes the app, loads the necessary configurations, parameters, and modules, and accommodates non-GIS methods.

#### app.js

This file embodies the main application logic and map interface.

### libs

This folder contains third-party libraries and frameworks employed in the project.

### locales

Here, we have the languages available for the application, excluding the default en-US language.