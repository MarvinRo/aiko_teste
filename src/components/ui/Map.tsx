import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -18.5794,  // Latitude de São Paulo, por exemplo
  lng: -46.5184   // Longitude de São Paulo, por exemplo
};

type Position = {
  date: string;
  lat: number;
  lon: number;
  equipmentId: string; // Adicionar o ID do equipamento na posição
};

type HourlyEarnings = {
  equipmentStateId: string;
  value: number;
};

type Equipment = {
  id: string;
  name: string;
  hourlyEarnings: HourlyEarnings[];
};

type TrackingMapProps = {
  positionData: Position[]; // Contém as posições com o ID do equipamento
  equipmentData: Equipment[]; // Contém os dados dos equipamentos e ganhos
};

const Tracking_Map: React.FC<TrackingMapProps> = ({ positionData, equipmentData }) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{ lat: number; lng: number } | null>(null);

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

  const handleMarkerClick = (id: string, lat: number, lng: number) => {
    if (selectedMarkerId === id) {
      // Toggle off if clicking the same marker
      setSelectedMarkerId(null);
      setInfoWindowPosition(null);
    } else {
      // Set the new marker as selected
      setSelectedMarkerId(id);
      setInfoWindowPosition({ lat, lng });
    }
  };

  const handleCloseClick = () => {
    setSelectedMarkerId(null);
    setInfoWindowPosition(null);
  };

  // Função para obter os ganhos por hora com base no equipmentId
  const getEquipmentHourlyEarnings = (equipmentId: string) => {
    const equipment = equipmentData.find(eq => eq.id === equipmentId);
    if (equipment) {
      return (
        <div>
          <h4>{equipment.name}</h4>
          <h5>Ganhos por Hora:</h5>
          {equipment.hourlyEarnings.map((earning, index) => (
            <p key={index}>
              Estado: {earning.equipmentStateId} - Valor: {earning.value}
            </p>
          ))}
        </div>
      );
    }
    return <p>Dados de ganhos não disponíveis</p>;
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBy_fS5k3CgvasyHncOvO9Rnwkhr3gAwWc">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={options}
      >
        {positionData.map((position, index) => (
          <Marker
            key={index}
            position={{ lat: position.lat, lng: position.lon }}
            onClick={() => handleMarkerClick(position.equipmentId, position.lat, position.lon)} // Passar o equipmentId e coordenadas ao clicar
          >
            {selectedMarkerId === position.equipmentId && infoWindowPosition && infoWindowPosition.lat === position.lat && infoWindowPosition.lng === position.lon && (
              <InfoWindow
                position={{ lat: position.lat, lng: position.lon }}
                onCloseClick={handleCloseClick}
              >
                <div>
                  <h3>Data: {position.date}</h3>
                  <p>Latitude: {position.lat}</p>
                  <p>Longitude: {position.lon}</p>
                  {getEquipmentHourlyEarnings(position.equipmentId)}
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
