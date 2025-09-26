import React, { useState } from 'react';

// Descontos
const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState(0);
const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState(0);
const [aplicarDescontoDeVendedor, definirAplicarDescontoDeVendedor] = useState(false);
// Cálculo do desconto contratual baseado no período