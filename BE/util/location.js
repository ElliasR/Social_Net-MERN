const axios = require('axios'); //http requests frontend to backend or backend to backend

const HttpError = require('../models/http-error');

const API_KEY = ''; //Google maps key

async function getCoordsForAddress(address) {      // const getCoordsForAddress = () => {...}
        return { //option if not using the google api with credit card
            lat: 42.3417158,
            lng: -3.7000628
        };
// const response = await axios.get(
//     `https:/maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//     address
//     )}&key=${YOUR_API_KEY}`
// );
 
// const data = response.data;

// if(!data || data.status === 'ZERO_RESULTS'){
//     const error = new HttpError('Location for the specified address not found. ', 422);
//     throw error;
// }
// const coordinates = data.results[0].geometry.location;

// return coordinates;
}

module.exports = getCoordsForAddress;