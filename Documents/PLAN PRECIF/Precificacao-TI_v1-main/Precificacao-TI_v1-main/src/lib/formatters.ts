export const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
        return "R$ 0,00";
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatPercent = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
        return "0,00%";
    }
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};
