import React, { useState } from 'react';

const MaquinasVirtuaisCalculator = () => {
  // Descontos
  const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState(0);
  const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState(0);
  const [aplicarDescontoDeVendedor, definirAplicarDescontoDeVendedor] = useState(false);
  // Cálculo do desconto contratual baseado no período

  return (
    <div>
      <h1>Calculadora de Máquinas Virtuais</h1>
    </div>
  );
};

export default MaquinasVirtuaisCalculator;