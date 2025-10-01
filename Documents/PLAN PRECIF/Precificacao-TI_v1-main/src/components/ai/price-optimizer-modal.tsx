"use client";

import React, { useState } from 'react';
import { Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { getPriceSuggestion } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/formatters';

interface PriceOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  productDescription: string;
}

interface Suggestion {
  suggestedAdjustment: number;
  reasoning: string;
}

const PriceOptimizerModal = ({ isOpen, onClose, currentPrice, productDescription }: PriceOptimizerModalProps) => {
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [competitorPricing, setCompetitorPricing] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getPriceSuggestion({
      currentPrice,
      productDescription,
      marketAnalysis,
      competitorPricing,
    });
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestion(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Erro na Otimização",
        description: result.error || "Não foi possível obter a sugestão da IA.",
      });
    }
  };

  const newSuggestedPrice = currentPrice + (suggestion?.suggestedAdjustment || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setSuggestion(null); // Reset on close
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Lightbulb className="text-primary" />
            Otimizador de Preço com IA
          </DialogTitle>
          <DialogDescription>
            Forneça dados de mercado para receber uma sugestão de ajuste de preço baseada em IA.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="market-analysis">Análise de Mercado</Label>
            <Textarea
              id="market-analysis"
              placeholder="Ex: A demanda por servidores cresceu 15% no último trimestre. Empresas de pequeno porte são as maiores compradoras."
              value={marketAnalysis}
              onChange={(e) => setMarketAnalysis(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="competitor-pricing">Preços da Concorrência</Label>
            <Textarea
              id="competitor-pricing"
              placeholder="Ex: Concorrente A vende um modelo similar por R$ 9.200,00. Concorrente B oferece por R$ 8.900,00 com menos memória."
              value={competitorPricing}
              onChange={(e) => setCompetitorPricing(e.target.value)}
            />
          </div>
        </div>

        {suggestion && (
          <div className="p-4 bg-muted rounded-lg space-y-4 border border-primary/20">
            <h4 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="text-primary w-5 h-5" /> Sugestão da IA</h4>
            <div className="text-center bg-background p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Ajuste Sugerido</p>
              <p className={`text-2xl font-bold ${suggestion.suggestedAdjustment >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(suggestion.suggestedAdjustment)}
              </p>
            </div>
            <div className="text-center bg-background p-4 rounded-md">
              <p className="text-sm text-muted-foreground">Novo Preço Final</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(newSuggestedPrice)}</p>
              <p className="text-xs text-muted-foreground">Preço original: {formatCurrency(currentPrice)}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Justificativa:</p>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleGetSuggestion}
            disabled={isLoading || !marketAnalysis || !competitorPricing}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {suggestion ? 'Gerar Nova Sugestão' : 'Obter Sugestão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceOptimizerModal;
