import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};


const defaultCenter = {
  lat:  -18.5794,
  lng: -46.5184
};

type Position = {
  date: string;
  lat: number;
  lon: number;
};

type TrackingMapProps = {
  positionData: Position[];
};

const Tracking_Map: React.FC<TrackingMapProps> = ({ positionData }) => {
  const [selectedMarker, setSelectedMarker] = useState<Position | null>(null);
  
  const center = positionData.length > 0
    ? {
        lat: positionData.reduce((sum, pos) => sum + pos.lat, 0) / positionData.length,
        lng: positionData.reduce((sum, pos) => sum + pos.lon, 0) / positionData.length
      }
    : defaultCenter;

  const options = {
    mapTypeControl: false, 
    streetViewControl: false, 
    fullscreenControl: false,
  };

  const handleMarkerClick = (position: Position) => {
    setSelectedMarker(prevMarker => prevMarker === position ? null : position);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBy_fS5k3CgvasyHncOvO9Rnwkhr3gAwWc"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={options}
      >
        {positionData.length > 0 && positionData.map((position, index) => (
          <Marker
            key={position.date + index} 
            position={{ lat: position.lat, lng: position.lon }}
            onClick={() => handleMarkerClick(position)}
          >
            {selectedMarker === position && (
              <InfoWindow
                key={position.date + index}
                position={{ lat: position.lat, lng: position.lon }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <h3>Data: {position.date}</h3>
                  <p>Latitude: {position.lat}</p>
                  <p>Longitude: {position.lon}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Tracking_Map;
