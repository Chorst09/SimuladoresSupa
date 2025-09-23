const fs = require('fs');

// Ler o arquivo
let content = fs.readFileSync('src/components/calculators/PABXSIPCalculator.tsx', 'utf8');

// Remover todas as linhas que contêm 'supabase' (exceto comentários)
const lines = content.split('\n');
const cleanedLines = lines.filter(line => {
    // Manter comentários que mencionam supabase
    if (line.trim().startsWith('//') && line.includes('supabase')) {
        return true;
    }
    // Remover linhas que usam supabase
    return !line.includes('supabase');
});

// Juntar as linhas novamente
content = cleanedLines.join('\n');

// Corrigir funções quebradas
content = content.replace(
    /const { error } = await[\s\S]*?\.upsert\([^}]*\}\);/g,
    '// Simplified - no database operation'
);

// Escrever o arquivo limpo
fs.writeFileSync('src/components/calculators/PABXSIPCalculator.tsx', content);

console.log('Arquivo limpo com sucesso!');