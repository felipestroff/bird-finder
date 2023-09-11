# Bird Finder - GIS Application for Bird Species Identification

A GIS progressive web application (PWA) designed to explore the capabilities of the [iNaturalist API](https://api.inaturalist.org/v1/docs). The goal is to provide users with the freedom to identify bird species in their region using various filters, including geometric ones.

This tool is crafted for birdwatching enthusiasts, ornithologists, and nature lovers. The main purpose of the application is to facilitate quick and precise identification of bird species leveraging a range of information, such as locations, scientific and common names, and areas of interest.

## Technologies

- JavaScript
- [Leaflet](https://leafletjs.com)
- [Leaflet Draw](https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html)
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [Bootstrap](https://getbootstrap.com)

## Installation

To install and configure WebGIS, follow the steps below:

1. Clone the repository to your local machine.
2. **Using a local server (such as XAMPP, WampServer, or IIS):**
   - Copy the project folder to your server's project directory (e.g., `htdocs` for XAMPP).
   - Start the server and access the project through a web browser using the corresponding URL (e.g., http://localhost/bird-finder).
3. **Using the Visual Studio Code Live Server plugin:**
   - Open the project in Visual Studio Code.
   - Install the "Live Server" plugin if you haven't already.
   - Right-click on the `index.html` file and select `Open with Live Server`. This will launch a local server and open the project in your default browser.
4. **Deploying through Heroku:**
   - [https://www.heroku.com] Log in to your Heroku account.
   - Click on the `New button`, followed by the `Create new app` option.
   - Assign a name to your app in the `App name` field.
   - Click on the `Create app` button.
   - Once the app is created, click on the `Deploy` tab.
   - In the `Deployment method` section, select `GitHub`.
   - In the `App connected to GitHub` section, connect to your GitHub account.
   - After connecting and granting the necessary permissions, search for the application repository on GitHub and click `Connect`.
   - To enable automatic deployments, navigate to `Automatic deploys` and activate deployment for the desired branch.
   - Initiate the first deployment of the application under `Manual deploy` by selecting the branch and then clicking on the `Deploy Branch` button.

## Directory Structure

### assets

This directory houses all the static resources such as images, icons, and fonts used in the project.

### config

Contains the project configuration files.

### css

This section holds the project style files, organized according to the BEM methodology or another methodology of your choice.

### js

Holds all the project's JavaScript scripts and core business logic.

#### main.js

The entry point of the application. It manages the service worker, loads the necessary configurations, parameters, and modules, and initializes the app.

#### app.js

Contains the primary logic class of the application and map interface.

#### controls

This folder contains all the application controllers/components, each with its respective responsibilities.

#### utils

This folder contains general utility classes to be called upon as needed.

### libs

This section contains the third-party libraries and frameworks used in the project.

### locales

Holds the languages available for the application, excluding the default language, en-US.

## Contact

For support or any additional questions, reach out to us at [email](mailto:stroff.felipe@gmail.com).
