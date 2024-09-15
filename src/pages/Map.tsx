import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import stateColors from '../data/equipmentState.json';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: -18.5794,
  lng: -46.5184,
};

type Equipment = {
  id: string;
  equipmentModelId: string;
  name: string;
};

type Model = {
  id: string;
  name: string;
  hourlyEarnings: HourlyEarnings[];
};

type StateHistory = {
  equipmentId: string;
  states: States[];
};

type States = {
  date: string;
  equipmentStateId: string;
};

type HourlyEarnings = {
  equipmentStateId: string;
  value: number;
};

type Position = {
  date: string;
  lat: number;
  lon: number;
};

type PositionHistory = {
  equipmentId: string;
  positions: Position[];
};

type TrackingMapProps = {
  positionData: PositionHistory[];
  equipmentData: Equipment[];
  modelData: Model[];
  stateData: StateHistory[];
};

const Tracking_Map: React.FC<TrackingMapProps> = ({ positionData, equipmentData, modelData, stateData }) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{ lat: number; lng: number } | null>(null);

  const center = positionData.length > 0 && positionData[0].positions.length > 0
    ? {
        lat: positionData[0].positions[0].lat,
        lng: positionData[0].positions[0].lon,
      }
    : defaultCenter;

  const options = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  const handleMarkerClick = (id: string, lat: number, lng: number) => {
    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
      setInfoWindowPosition(null);
    } else {
      setSelectedMarkerId(id);
      setInfoWindowPosition({ lat, lng });
    }
  };

  const handleCloseClick = () => {
    setSelectedMarkerId(null);
    setInfoWindowPosition(null);
  };

  const getStateDetails = (stateId: string | undefined) => {
    return stateColors.find(state => state.id === stateId);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBy_fS5k3CgvasyHncOvO9Rnwkhr3gAwWc">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={options}
      >
        {positionData.map(posHistory =>
          posHistory.positions.map((position, index) => {
            const model = modelData.find(ml => ml.id === equipmentData.find(equip => equip.id === posHistory.equipmentId)?.equipmentModelId);
            const stateHistory = stateData.find(st => st.equipmentId === posHistory.equipmentId);
            const state = stateHistory?.states.find(s => s.date === position.date);
            const stateDetails = getStateDetails(state?.equipmentStateId);

            return (
              <Marker
                key={index}
                position={{ lat: position.lat, lng: position.lon }}
                onClick={() => handleMarkerClick(posHistory.equipmentId, position.lat, position.lon)}
              >
                {selectedMarkerId === posHistory.equipmentId && infoWindowPosition && infoWindowPosition.lat === position.lat && infoWindowPosition.lng === position.lon && (
                  <InfoWindow
                    position={{ lat: position.lat, lng: position.lon }}
                    onCloseClick={handleCloseClick}
                  >
                    <div>
                      <h2>Modelo: {model ? model.name : 'Modelo não disponível'}</h2>
                      <h3>Data: {position.date}</h3>
                      <p>Latitude: {position.lat}</p>
                      <p>Longitude: {position.lon}</p>
                      <p>Status: <div style={{ backgroundColor: stateDetails?.color || '', padding: '4px' }}>
                        <p>{stateDetails ? stateDetails.name : 'Nenhum Status definido'}</p>
                      </div></p>
                      
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Tracking_Map;
