// @flow
import React, { Component } from 'react';
import ReactMapboxGl from 'react-mapbox-gl';
import { Marker, Popup, Layer, Feature } from "react-mapbox-gl";
import mapboxgl from 'mapbox-gl';
import CityPin from '../constants/CityPin';
import PropertyPopup from './PropertyPopup';
import * as Api from '../api/api';
import * as Format from '../utils/format';

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiYmNoZW5nMTk5NiIsImEiOiJjazJtb2k3OTgwazdsM2JqcHJ6eG4xbWExIn0.uBnju3v1L3jvMa3TzwH2mQ';
mapboxgl.accessToken = MAPBOX_TOKEN;
const Map = ReactMapboxGl({
  accessToken: MAPBOX_TOKEN,
  injectCSS: false
});

type Props = {
  center: Dict,
  property: Dict,
  width: Number,
  height: Number
};

export default class MyMap extends Component {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      mapStyle: 'mapbox://styles/mapbox/basic-v8',
    };
  }

  getCenterWithOffset = (lat, lng) => {
    return {
      lat: lat,
      lng: parseFloat(lng) + 0.1
    }
  }

  render() {
    const { mapStyle } = this.state;
    const { center, property, width, height, selected_property, selected_property_id, properties, centerMap} = this.props;
    
    return (
      <Map
        style={mapStyle}
        containerStyle={{
          height: height,
          width: width,
          overflowX: 'hidden'
        }}
        center={center? this.getCenterWithOffset(center.lat, center.lng): {'lng':-0.2416815, 'lat':51.5285582}}
        onDragEnd={(map) => centerMap(map.getCenter().lat, map.getCenter().lng)}
      >

        <Layer>
        {properties.map((val, index) => {
            return(
              <Popup 
              coordinates={[val.Address.longitude, val.Address.latitude]}
              anchor={"bottom"}
              offset={[0,-10]}
            >
              <h1>{Format.formatCurrency(val.estimate)}</h1>
            </Popup>
            )
          })}
        </Layer>

        
        <Layer type="symbol" id="circle" layout={{ 'icon-image': 'circle-15'}}>
          {properties.map((val, index) => {
            if(selected_property_id && selected_property_id == val._id){
              return <Feature/>
            }else{
              return <Feature key={val._id} coordinates={[val.Address.longitude, val.Address.latitude]}/>
            }
          })}
        </Layer>


          {properties.map((val, index) => {
            return(
              <Popup 
              coordinates={[val.Address.longitude, val.Address.latitude]}
              anchor={"bottom"}
              offset={[0,-10]}
            >
              <h1>{Format.formatCurrency(val.estimate)}</h1>
            </Popup>
            )
          })}

          {selected_property_id ?     
          <Marker 
            coordinates={{lat: selected_property.Address.latitude, lng: selected_property.Address.longitude}} 
            anchor={"bottom-left"}
            offsetLeft={-64}
            offsetTop={128}> 
              <CityPin size={20}/> 
          </Marker>: null}

      </Map>
    );
  }
}

MyMap.defaultProps = {
  height: '100vh',
  width: '100vw'
}
