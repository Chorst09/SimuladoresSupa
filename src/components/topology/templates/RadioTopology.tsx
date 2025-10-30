import { TopologyTemplate, NetworkDevice } from '../types/topology';

export function createRadioTopology(
  customerName: string,
  customizations: Record<string, any> = {}
): TopologyTemplate {
  const layout = {
    width: 800,
    height: 350,
    padding: 50
  };

  const antennaTxModel = customizations['q-antena-modelo-tx'] || 'Antena TX';
  const antennaRxModel = customizations['q-antena-modelo-rx'] || 'Antena RX';
  const routerModel = customizations['q-roteador-modelo'] || 'Router';
  const linkDistance = customizations['q-distancia-enlace'] || 'N/A';

  const devices: NetworkDevice[] = [
    {
      id: 'provider-tower',
      type: 'tower' as const,
      label: 'Torre Provedor',
      position: { x: 150, y: 150 },
      icon: '🗼',
      quantityKey: 'towers'
    },
    {
      id: 'provider-antenna',
      type: 'antenna' as const,
      label: antennaTxModel,
      position: { x: 150, y: 100 },
      icon: '📡',
      quantityKey: 'antennas'
    },
    {
      id: 'customer-tower',
      type: 'tower' as const,
      label: 'Torre Cliente',
      position: { x: 650, y: 150 },
      icon: '🗼',
      quantityKey: 'towers'
    },
    {
      id: 'customer-antenna',
      type: 'antenna' as const,
      label: antennaRxModel,
      position: { x: 650, y: 100 },
      icon: '📡',
      quantityKey: 'antennas'
    },
    {
      id: 'customer-router',
      type: 'router' as const,
      label: routerModel,
      position: { x: 650, y: 220 },
      icon: '🔀',
      quantityKey: 'routers'
    },
    {
      id: 'client-devices',
      type: 'client' as const,
      label: 'Dispositivos',
      position: { x: 650, y: 280 },
      icon: '💻',
      quantityKey: 'clients'
    }
  ];

  const connections = [
    {
      id: 'tower-to-antenna-provider',
      from: 'provider-tower',
      to: 'provider-antenna',
      type: 'ethernet' as const,
      label: 'Cabo RF',
      style: {
        color: '#6b7280',
        strokeWidth: 2
      }
    },
    {
      id: 'radio-link',
      from: 'provider-antenna',
      to: 'customer-antenna',
      type: 'wireless' as const,
      label: `Enlace de Rádio (${linkDistance})`,
      style: {
        color: '#f59e0b',
        strokeWidth: 3,
        strokeDasharray: '8,4'
      }
    },
    {
      id: 'tower-to-antenna-customer',
      from: 'customer-antenna',
      to: 'customer-tower',
      type: 'ethernet' as const,
      label: 'Cabo RF',
      style: {
        color: '#6b7280',
        strokeWidth: 2
      }
    },
    {
      id: 'tower-to-router',
      from: 'customer-tower',
      to: 'customer-router',
      type: 'ethernet' as const,
      label: 'Ethernet',
      style: {
        color: '#3b82f6',
        strokeWidth: 2
      }
    },
    {
      id: 'router-to-devices',
      from: 'customer-router',
      to: 'client-devices',
      type: 'ethernet' as const,
      label: 'LAN',
      style: {
        color: '#3b82f6',
        strokeWidth: 2
      }
    }
  ];

  return {
    devices,
    connections,
    layout
  };
}