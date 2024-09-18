import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import stateColors from '../data/equipmentState.json';

const containerStyle = { //configuração de estilização do mapa
  width: '100%',
  height: '100%',
  maxWidth: '1200px',
  maxHeight: '600px',
  margin: '0 auto',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
};

const defaultCenter = { //Define o "marco 0" ponto inicial de latitude e longitude do mapa
  lat: -18.5794,
  lng: -46.5184,
};


// Defina os tipos conforme sua estrutura de dados

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

  const center = positionData.length > 0 && positionData[0].positions.length > 0 //Utiliza os dados de latitude e longitudes informados pelo equipamento selecionado caso não tenha é centralizado o ponto inicial definido
    ? {
        lat: positionData[0].positions[0].lat,
        lng: positionData[0].positions[0].lon,
      }
    : defaultCenter;

    //Opções de configuração do Mapa
  const options = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  const handleMarkerClick = (id: string, lat: number, lng: number) => {
    //Se o marcador selecionado é desmarcado (clicando em outro marcador ele fechara a aba de informações e é desmarcado)
    if (selectedMarkerId === id) { 
      setSelectedMarkerId(null);
      setInfoWindowPosition(null);
    } 
    //Quando um novo marcador é selecionado as informações são atualizadas para aquele que foi marcado
    else { 
      setSelectedMarkerId(id);
      setInfoWindowPosition({ lat, lng });
    }
  };

  //Ao clicar no botão para fechar a janela ele limpa os estados de seleção e informação do marcador
  const handleCloseClick = () => {
    setSelectedMarkerId(null);
    setInfoWindowPosition(null);
  };

  //Busca a relação das cores dos estados dos equipamentos.
  const getStateDetails = (stateId: string | undefined) => {
    return stateColors.find(state => state.id === stateId);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBy_fS5k3CgvasyHncOvO9Rnwkhr3gAwWc"> {/*Não coloquei a chave em um arquivo .env por duvida se vc utilizariam uma própria ou não, então deixei para facilitar o uso mas ela será desabilitada em 30 dias */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={options}
      >
        {/* Faz a seleção dos dados para serem apresentados no mapa */}
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
                    {/*Apresenta os dados do equipamento selecionado dentro do marcador */}
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
