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

//Combina as informações para exportar para o Map

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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { equipment, positionHistory, models, stateHistory, states } = useData(); //Recebe as iformações vindas do hook useData

  useEffect(() => {
    const fetchData = async () => {

      // Tenta fazer a manipulação dos dados recebidos para depois serem utilizados no combined / CombinedData
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
    return true;
  });

  const selectedEquipment = filteredEquipment.find(equip => equip.id === selectedEquipmentId);

  // Limpa o status e restaura as posições originais do equipamento antes do filtro
  const handleClearStatus = () => {
    setSelectedStatus([]);
  };

  // Limpa o horário e restaurar as posições originais do equipamento antes do filtro
  const handleClearTime = () => {
    setSelectedTime(null);
  };

  // Função de filtro das posições com base no equipamento, status e horário
  const filteredPositions = selectedEquipment
    ? selectedTime
      ? {
          ...selectedEquipment,
          positions: selectedEquipment.positions.filter(position => position.date === selectedTime), // Faz o filtro da posição do equipamento selecionado pela data e hora
        }
      : selectedStatus.length > 0
      ? {
        //Faz o filtro de todas as posições esteve com o estatus escolhido
          ...selectedEquipment,
          positions: selectedEquipment.positions.filter(position => {
            const stateForPosition = selectedEquipment.stateHistory.states.find(
              state => state.date === position.date
            );
            return stateForPosition && selectedStatus.includes(stateForPosition.equipmentStateId);
          }),
        }
      : selectedEquipment
    : null;

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='m-0 p-0 h-[100vh]'>
      <div className="flex justify-center my-4">
        <div className="flex">
          <Label className="flex my-auto mr-4">Equipamentos:</Label>
          <Select onValueChange={value => setSelectedEquipmentId(value)} >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o Equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Equipamentos</SelectLabel> {/* Select das informações dos equipamentos mapeados */}
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value={''}>Nenhum equipamento disponível</SelectItem>/*  Caso não encontre uma base de equipamentos informara a mensagem */
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex ml-4">
          <Label className="flex my-auto mr-4">Horário:</Label>
          <Select onValueChange={value => setSelectedTime(value)} disabled={!selectedEquipment}> {/* Caso não tenha selecionado nenhum equipamento o capos permanecerá desabilitado */}
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Horário</SelectLabel> {/* Select das informações das datas e horas mapeados */}
                {selectedEquipment?.positions.map((position, index) => (
                  <SelectItem key={index} value={position.date}>
                    {position.date}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className='ml-2' disabled={!selectedEquipment} onClick={handleClearTime}>
            Limpar hora
          </Button>
        </div>

        <div className="flex ml-4">
          <Label className="flex my-auto mr-4">Status:</Label>
          <Select onValueChange={values => setSelectedStatus(values)} disabled={!selectedEquipment}> {/* Caso não tenha selecionado nenhum equipamento o capos permanecerá desabilitado */}
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
          <Button className='ml-2' disabled={!selectedEquipment} onClick={handleClearStatus}>
            Limpar Status
          </Button>
        </div>
      </div>
      <div className="flex mx-auto rounded-sm justify-center h-[520px]">
        {/* Passa as informações necessárias para ser apresentado no MAP */}
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
