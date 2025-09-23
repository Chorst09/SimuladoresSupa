// Script para atualizar apenas os valores específicos no arquivo PABX
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/calculators/PABXSIPCalculator.tsx');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Substituir os valores específicos
content = content.replace(/'500': 0, \/\/ Valor a combinar/g, "'500': 4000, // De 101 a 500");
content = content.replace(/'1000': 0 \/\/ Valor a combinar/g, "'1000': 4500 // De 501 a 1000");

// Para hosting
content = content.replace(/hosting: \{[\s\S]*?'500': 0, \/\/ Valor a combinar[\s\S]*?'1000': 0 \/\/ Valor a combinar/g, 
    `hosting: {
            '10': 200,
            '20': 220,
            '30': 250,
            '50': 300,
            '100': 400,
            '500': 450, // De 01 a 500
            '1000': 500 // De 501 a 1000`);

// Para device
content = content.replace(/device: \{[\s\S]*?'500': 0, \/\/ Valor a combinar[\s\S]*?'1000': 0 \/\/ Valor a combinar/g,
    `device: {
            '10': 35,
            '20': 34,
            '30': 33,
            '50': 32,
            '100': 30,
            '500': 29, // De 101 a 500
            '1000': 28 // De 501 a 1000`);

// Escrever o arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('Valores atualizados com sucesso!');