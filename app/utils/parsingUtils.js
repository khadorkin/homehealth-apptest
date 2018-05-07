var HTMLParser = require('fast-html-parser');

const ParseGooglePlacesAPIResponse = (data, details) => {

    console.log('details:', details);
    const address = details.address_components;

    let zip = null;
    let city = null;
    let state = null;
    let country = null;
    let lat = null;
    let long = null;

    let streetAddress = details.formatted_address;

    // Parsing the HTML to extract components to drop from streetAddress
    const adrAddress = details.adr_address;
    const parsedHTMLAddr = HTMLParser.parse(adrAddress);

    let postalCode = null;
    let countryName = null;
    let stateName = null;
    try {
        postalCode = parsedHTMLAddr.querySelector('.postal-code').rawText;
    } catch (e) {
        console.log('PostalCode not found in address:', e);
    }
    try {
        countryName = parsedHTMLAddr.querySelector('.country-name').rawText;
    } catch (e) {
        console.log('CountryName not found in address:', e);
    }
    try {
        stateName = parsedHTMLAddr.querySelector('.region').rawText;
    } catch (e) {
        console.log('StateName not found in address:', e);
    }

    const geometry = details.geometry;

    address.forEach((component) => {
        const types = component.types;
        // Todo: Handle edge cases for city
        if (types.indexOf('locality') > -1) {
            city = component.long_name;
        }

        // Todo: Need to remove the LAST OCCURENCE of each component
        if (types.indexOf('administrative_area_level_1') > -1) {
            state = component.short_name;
            const stateLongName = component.long_name;
            if (stateLongName && streetAddress.lastIndexOf(`, ${stateLongName}`) > -1) {
                streetAddress = streetAddress.replace(`, ${stateLongName}`, '');
            } else if (stateName && streetAddress.lastIndexOf(`, ${stateName}`) > -1) {
                streetAddress = streetAddress.replace(`, ${stateName}`, '');
            } else if (state && streetAddress.lastIndexOf(`, ${state}`) > -1) {
                streetAddress = streetAddress.replace(`, ${state}`, '');
            }
        }

        if (types.indexOf('postal_code') > -1) {
            zip = component.long_name;
            if (zip && streetAddress.lastIndexOf(` ${zip}`) > -1) {
                streetAddress = streetAddress.replace(` ${zip}`, '');
            } else if (postalCode && streetAddress.lastIndexOf(`, ${postalCode}`) > -1) {
                streetAddress = streetAddress.replace(` ${postalCode}`, '');
            }
        }

        if (types.indexOf('country') > -1) {
            country = component.long_name;
            if (country && streetAddress.lastIndexOf(`, ${country}`) > -1) {
                streetAddress = streetAddress.replace(`, ${country}`, '');
            } else if (countryName && streetAddress.lastIndexOf(`, ${countryName}`) > -1) {
                streetAddress = streetAddress.replace(`, ${countryName}`, '');
            }
        }
    });

    if (geometry) {
        const location = geometry.location;
        if (location) {
            lat = location.lat;
            long = location.lng;
        }
    }

    const response = {
        zip, city, stateName: state, country, streetAddress, lat, long
    };

    return response;
};

export {ParseGooglePlacesAPIResponse};
