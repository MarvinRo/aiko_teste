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
import Tracking_Map from '@/components/ui/Map';
import equipment from '../data/equipment.json';
import position from '../data/equipmentPositionHistory.json';
import { useState, useEffect } from 'react';

type EquipmentPosition = {
  date: string;
  lat: number;
  lon: number;
  equipmentId: string;
};

type HourlyEarnings = {
  equipmentStateId: string;
  value: number;
};

type Equipment = {
  id: string;
  equipmentModelId: string;
  name: string;
  hourlyEarnings?: HourlyEarnings[]; // Tornar hourlyEarnings opcional
};

type PositionHistory = {
  equipmentId: string;
  positions: Omit<EquipmentPosition, 'equipmentId'>[];
};

type CombinedData = {
  id: string;
  name: string;
  hourlyEarnings: HourlyEarnings[]; // Garantir que hourlyEarnings esteja presente aqui
  positions: EquipmentPosition[];
};

function App() {
  const [dataEquipment, setDataEquipment] = useState<CombinedData[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Supondo que os dados do arquivo são compatíveis com o tipo Equipment
        const equipmentData: Equipment[] = await new Promise(resolve => resolve(equipment));
        const positionData: PositionHistory[] = await new Promise(resolve => resolve(position));

        const combined = equipmentData.map(equip => {
          const posHistory = positionData.find(pos => pos.equipmentId === equip.id);
          const positionsWithId = posHistory
            ? posHistory.positions.map((pos) => ({
                ...pos,
                equipmentId: equip.id,
              }))
            : [];

          return {
            id: equip.id,
            name: equip.name,
            hourlyEarnings: equip.hourlyEarnings || [], // Garantir que hourlyEarnings é um array
            positions: positionsWithId,
          };
        });

        setDataEquipment(combined);
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedEquipment = dataEquipment.find(equip => equip.id === selectedEquipmentId);
  const positionData = selectedEquipment ? selectedEquipment.positions : [];

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className=''>
      <div className='flex'>
        <Select onValueChange={(value) => setSelectedEquipmentId(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o Equipamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Equipamentos</SelectLabel>
              {dataEquipment.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col justify-center mx-auto'>
        <h1>Meu Mapa Google</h1>
        <Tracking_Map positionData={positionData} equipmentData={dataEquipment} />
      </div>
    </div>
  );
}

export default App;
