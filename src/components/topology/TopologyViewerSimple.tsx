'use client';

import React, { useState, useEffect } from 'react';
import { TopologyConfig, NetworkDevice, Connection } from './types/topology';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TopologyViewerProps {
  config: TopologyConfig;
  showExportOptions?: boolean;
  className?: string;
  onExport?: (format: 'png' | 'pdf' | 'svg') => void;
}

export function TopologyViewer({ 
  config, 
  showExportOptions = false, 
  className = '',
  onExport 
}: TopologyViewerProps) {
  const getTopologyTitle = () => {
    const titles: Record<string, string> = {
      'fiber': 'Topologia - Internet via Fibra Óptica',
      'radio': 'Topologia - Internet via Rádio Enlace',
      'wifi': 'Topologia - Access Points (Wi-Fi)',
      'sdwan': 'Topologia - SD-WAN'
    };
    return titles[config.type] || 'Topologia de Rede';
  };

  const [devices, setDevices] = useState<NetworkDevice[]>([]);

  useEffect(() => {
    // Simplified device generation
    const newDevices: NetworkDevice[] = [];
    const quantities = config.customizations || {};

    // Generate devices based on type
    if (config.type === 'fiber') {
      for (let i = 0; i < (quantities.routers || 1); i++) {
        newDevices.push({
          id: `router-${i}`,
          label: `Router ${i + 1}`,
          type: 'router',
          position: { x: 100 + i * 150, y: 100 }
        });
      }
    } else if (config.type === 'radio') {
      for (let i = 0; i < (quantities.towers || 1); i++) {
        newDevices.push({
          id: `tower-${i}`,
          label: `Torre ${i + 1}`,
          type: 'tower',
          position: { x: 100 + i * 150, y: 100 }
        });
      }
    } else if (config.type === 'wifi') {
      for (let i = 0; i < (quantities.aps || 1); i++) {
        newDevices.push({
          id: `ap-${i}`,
          label: `Access Point ${i + 1}`,
          type: 'ap',
          position: { x: 100 + i * 150, y: 100 }
        });
      }
    }

    setDevices(newDevices);
  }, [config]);

  return (
    <div className={`topology-viewer ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getTopologyTitle()}
          </h3>
          <p className="text-sm text-gray-600">
            Cliente: {config.customerName} | Endereço: {config.address}
          </p>
        </div>
        
        {showExportOptions && (
          <div className="flex gap-2">
            <button
              onClick={() => onExport?.('png')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              PNG
            </button>
            <button
              onClick={() => onExport?.('pdf')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Simplified Diagram */}
      <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-white min-h-[400px]">
        <div className="text-center text-gray-500 mt-20">
          <h4 className="text-lg font-medium mb-2">{getTopologyTitle()}</h4>
          <p className="text-sm">Diagrama de topologia para {config.customerName}</p>
          <div className="mt-4 space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="inline-block mx-2 p-2 bg-blue-100 rounded">
                {device.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {config.type === 'fiber' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span>Fibra Óptica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet</span>
              </div>
            </>
          )}
          {config.type === 'radio' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500 border-dashed border-t"></div>
                <span>Enlace de Rádio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet</span>
              </div>
            </>
          )}
          {config.type === 'wifi' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet/PoE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-cyan-500 border-dashed border-t"></div>
                <span>CAPWAP</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
