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
import { Button } from '@/components/ui/button';

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
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // Estado para horário
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]); // Estado para status (array)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { equipment, positionHistory, models, stateHistory, states } = useData();

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
            stateHistory: state
              ? {
                equipmentId: state.equipmentId,
                states: state.states,
              }
              : {
                equipmentId: 'N/A',
                states: [{ date: 'N/A', equipmentStateId: 'N/A' }],
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

  // Mapeia o estado e a cor para uso no seletor
  const stateMapping = states.reduce((map, state) => {
    map[state.id] = { name: state.name, color: state.color };
    return map;
  }, {} as Record<string, { name: string; color: string }>);

  // Obtém os nomes dos estados únicos para preencher o seletor
  const uniqueStates = Array.from(
    new Set(
      dataEquipment.flatMap(equip => equip.stateHistory.states.map(state => state.equipmentStateId))
    )
  ).map(id => ({ id, ...stateMapping[id] }));

  const filteredEquipment = dataEquipment.filter(equip => {
    if (selectedStatus.length > 0) {
      return equip.stateHistory.states.some(state => selectedStatus.includes(state.equipmentStateId));
    }
    return true; // Mostra todos se nenhum status for selecionado
  });

  const selectedEquipment = filteredEquipment.find(equip => equip.id === selectedEquipmentId);

  useEffect(() => {
    if (selectedEquipment && selectedEquipment.positions.length > 0) {
      const firstPosition = selectedEquipment.positions[0];
    }
  }, [selectedEquipment]);

  // Função para limpar a seleção de status e restaurar as posições originais do equipamento
const handleClearStatus = () => {
  setSelectedStatus([]); // Limpa a seleção de status
};

// Função para limpar a seleção de horário e restaurar as posições originais do equipamento
const handleClearTime = () => {
  setSelectedTime(null); // Limpa a seleção de horário
};

// Função de filtro das posições com base no equipamento, status e horário
const filteredPositions = selectedEquipment
  ? selectedTime
    ? {
        ...selectedEquipment,
        positions: selectedEquipment.positions.filter(position => position.date === selectedTime),
      }
    : selectedStatus.length > 0
    ? {
        ...selectedEquipment,
        positions: selectedEquipment.positions.filter(position => {
          const stateForPosition = selectedEquipment.stateHistory.states.find(
            state => state.date === position.date
          );
          return stateForPosition && selectedStatus.includes(stateForPosition.equipmentStateId);
        }),
      }
    : selectedEquipment // Caso não haja status ou horário selecionado, retorna todas as posições do equipamento
  : null;
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex justify-center align-middle flex-row mt-4 ml-4">
        <div className="flex">
          <Label className="flex mr-4">Equipamentos:</Label>
          <Select onValueChange={value => setSelectedEquipmentId(value)} >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o Equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Equipamentos</SelectLabel>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>Nenhum equipamento disponível</SelectItem>//bloqueia o select caso não tenha nenhum equipamento na base de dados
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex ml-4">
          <Label className="flex mr-4">Horário:</Label>
          <Select onValueChange={value => setSelectedTime(value)} disabled={!selectedEquipment}> {/* desabilita o select caso não tenha um equipamento selecionado */}
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Horário</SelectLabel>
                {selectedEquipment?.positions.map((position, index) => (
                  <SelectItem key={index} value={position.date}>
                    {position.date}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button disabled={!selectedEquipment} onClick={()=>{handleClearTime();setSelectedTime(null);}}>
            Limpar hora
          </Button>
        </div>

        <div className="flex ml-4">
          <Label className="flex mr-4">Status:</Label>
          <Select onValueChange={values => setSelectedStatus(values)} disabled={!selectedEquipment}>{/* desabilita o select caso não tenha um equipamento selecionado */}
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {uniqueStates.length > 0 ? (
                  uniqueStates.map((state, index) => (
                    <SelectItem key={index} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>Nenhum status disponível</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button disabled={!selectedEquipment} onClick={()=>{handleClearStatus();setSelectedStatus([]);}}>
            Limpar Status
          </Button>
        </div>
      </div>

      <div className="flex flex-col justify-center my-8 mx-[500px]">
        <Tracking_Map
          positionData={filteredPositions ? [filteredPositions] : []}
          equipmentData={filteredEquipment}
          modelData={models}
          stateData={stateHistory}
        />
      </div>
    </div>
  );
}

export default App;


/* positionData={selectedEquipment ? [selectedEquipment] : []} */