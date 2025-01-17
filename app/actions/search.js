// @flow
// Search Zillow API
import type { GetState, Dispatch } from '../reducers/types';
import * as Zillow from '../api/zillow';
import * as Api from '../api/api';
const xml2js =  require('xml2js')
const parser = new xml2js.Parser({'explicitArray': false})

export const SEARCHING = "SEARCHING";
export const RECIEVE_SEARCH = 'RECIEVE_SEARCH';
export const SEARCH_FAIL = 'SEARCH_FAIL';
export const CENTER_MAP = "CENTER_MAP";
export const EMPTY_SEARCH = 'EMPTY_SEARCH';

export function searching() {
  return {
    type: SEARCHING
  };
}

export function search_success(property) {
  return {
    type: RECIEVE_SEARCH,
    property
  };
}

export function search_fail() {
  return {
    type: SEARCH_FAIL,
  };
}

export function center_map(lat, lng) { 
  return {
    type: CENTER_MAP,
    center: {
      'lat': lat, 
      'lng': lng,
    }
  };
}

export function emptySearch() {
  return {
    type: EMPTY_SEARCH
  };
}

export function searchProperty(search_term) {
  return function(dispatch){

    dispatch(searching())

    return Zillow.getProperty(search_term)
      .then(response => {
        if(response){
          // Initial response with property information
          parser.parseString(response, (err, res) => {
            let res_property = res['Zestimate:zestimate']['response']
            if(!res_property) {
              dispatch(search_fail())
              return;
            }
            // dispatch(search_success(res_property))
            // dispatch(center_map(res_property['address']['latitude'], res_property['address']['longitude']))
            Zillow.deepSearch(res_property['address']['street'], res_property['address']['city'] + ", " + res_property['address']['state'])
              .then(detailed_response => {
                if(detailed_response) {
                  console.log("Detailed response")
                  // Detailed response with addtional property information
                  parser.parseString(detailed_response, (err, detailed_res)=> {
                    const res_detailed_property = detailed_res['SearchResults:searchresults']
                    if(res_detailed_property['response']) {
                        res_property['details'] = res_detailed_property['response']['results']['result']
                    }else{
                      res_property['details'] = {}
                    }
                    dispatch(search_success(res_property))
                    dispatch(center_map(res_property['address']['latitude'], res_property['address']['longitude']))     
                  })
                }
              })
          })
        }
    })
  }
}


function formatZillowResponse(raw_res) {
  let res = {}
  raw_res_address = raw_res['address'][0]
  res['address'] = {
    "city": raw_res_address['city'][0],
    "latitude": raw_res_address['latitude'][0],
    "longitude": raw_res_address['longitutde'][0],
    "state": raw_res_address['state'][0],
    "street": raw_res_address['street'][0],
    "zipcode": raw_res_address['zipcode'][0]
  }
}