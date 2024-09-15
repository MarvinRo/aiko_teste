import '../style/index.css';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Tracking_Map from '@/pages/Map';
import { useData } from '../hooks/useData';
import { useState, useEffect } from 'react';
import { Label } from '@radix-ui/react-label';

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

type CombinedData = {
  id: string;
  name: string;
  equipmentId: string;
  equipmentModelId: string;
  hourlyEarnings: HourlyEarnings[];
  positions: Position[];
  stateHistory: {
    equipmentId: string;
    states: States[];
  };
};

function App() {
  const [dataEquipment, setDataEquipment] = useState<CombinedData[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { equipment, positionHistory, models, stateHistory } = useData();  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipmentData: Equipment[] = Array.isArray(equipment) ? equipment : [];
        const positionData: PositionHistory[] = Array.isArray(positionHistory) ? positionHistory : [];
        const modelData: Model[] = Array.isArray(models) ? models : [];
        const stateData: StateHistory[] = Array.isArray(stateHistory) ? stateHistory : [];

        const combined = equipmentData.map(equip => {
          const posHistory = positionData.find(pos => pos.equipmentId === equip.id);
          const model = modelData.find(md => md.id === equip.equipmentModelId);
          const state = stateData.find(st => st.equipmentId === equip.id);

          return {
            id: equip.id,
            name: equip.name,
            equipmentId: equip.id,
            equipmentModelId: model ? model.id : 'Modelo não disponível',
            hourlyEarnings: model ? model.hourlyEarnings : [{ equipmentStateId: '0', value: 0 }],
            positions: posHistory ? posHistory.positions : [{ date: 'N/A', lat: 0, lon: 0 }],
            stateHistory: state ? {
              equipmentId: state.equipmentId,
              states: state.states
            } : {
              equipmentId: 'N/A',
              states: [{ date: 'N/A', equipmentStateId: 'N/A' }]
            },
          };
        });
        setDataEquipment(combined);
      } catch (err) {
        setError(`Erro ao carregar dados: ${err.message}`);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
      
    };

    fetchData();
  }, [equipment, positionHistory, models, stateHistory]);



  const selectedEquipment = dataEquipment.find(equip => equip.id === selectedEquipmentId);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className=''>
      <div className='flex'>
        <Label>Equipamentos:</Label>
        <Select onValueChange={value => setSelectedEquipmentId(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o Equipamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Equipamentos</SelectLabel>
              {dataEquipment.length > 0 ? (
                dataEquipment.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled>Nenhum equipamento disponível</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>


      </div>
      <div className='flex flex-col justify-center mx-auto'>
        <h1>Meu Mapa Google</h1>
        <Tracking_Map
          positionData={selectedEquipment ? [selectedEquipment] : []}
          equipmentData={dataEquipment}
          modelData={models}
          stateData={stateHistory}
        />
      </div>
    </div>
  );
}

export default App;
