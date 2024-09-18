import { useState, useEffect } from 'react';

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

type HourlyEarnings = {
  equipmentStateId: string;
  value: number;
};

type States = {
  id: string;
  name: string;
  color: string;
};

type StateHistory = {
  equipmentId: string;
  states: StatesH[];
};

type StatesH = {
  date: string;
  equipmentStateId: string;
};

type PositionHistory = {
  equipmentId: string;
  positions: Position[];
};

type Position = {
  date: string;
  lat: number;
  lon: number;
};

// Importar os arquivos JSON diretamente
import equipmentData from '../data/equipment.json';
import statesData from '../data/equipmentState.json';
import modelsData from '../data/equipmentModel.json';
import stateHistoryData from '../data/equipmentStateHistory.json';
import positionHistoryData from '../data/equipmentPositionHistory.json';

export const useData = () => {
  const [states, setStates] = useState<States[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [stateHistory, setStateHistory] = useState<StateHistory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Seta os estados com as informações dos arquivos JSON
      setEquipment(equipmentData);
      setStates(statesData);
      setModels(modelsData);
      setStateHistory(stateHistoryData);
      setPositionHistory(positionHistoryData);
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);//caso tenho não consiga setar as informações.
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  }, []);

  return { equipment, positionHistory, models, stateHistory, states, loading, error };
};
