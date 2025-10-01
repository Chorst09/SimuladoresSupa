"use client"

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onConfigClick: () => void;
  taxRegimeName: string;
}

const AppHeader = ({ onConfigClick, taxRegimeName }: AppHeaderProps) => (
  <header className="mb-8 relative p-0" style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
    <img
      src="https://media.treasy.com.br/media/2017/12/OrC3A7amento-de-TI.png"
      alt="Banner TI"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '220px', objectFit: 'cover', zIndex: 0 }}
    />
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '220px', background: 'rgba(20,20,20,0.6)', zIndex: 1 }} />
    <div style={{ position: 'relative', zIndex: 2, height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="text-5xl font-headline font-bold text-primary tracking-tight text-center">
        Precificação de TI
      </h1>
      <p className="text-xl text-muted-foreground mt-2 text-center">
        Regime Tributário Ativo: <span className="font-semibold text-primary/80">{taxRegimeName}</span>
      </p>
    </div>
    <Button
      onClick={onConfigClick}
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 text-muted-foreground hover:text-primary z-10"
      aria-label="Abrir configurações"
    >
      <SlidersHorizontal size={24} />
    </Button>
  </header>
);

export default AppHeader;
