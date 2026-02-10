// Test script to verify the 3 conversion scenarios
// Example: 48 Threads and 32GB RAM should show:
// - Otimizado: 12 vCPUs | 16 GB RAM
// - Recomendado: 24 vCPUs | ~24 GB RAM  
// - Avançado: 48 vCPUs | 28 GB RAM

function roundToEven(num) {
  return Math.ceil(num / 2) * 2;
}

function calculateScenarios(totalThreads, physicalRam) {
  const hypervisorReserve = 4; // Default hypervisor reserve in GB

  const scenarios = [
    {
      name: 'Otimizado',
      vCpus: roundToEven(totalThreads / 4),
      vRam: Math.round(physicalRam * 0.5),
    },
    {
      name: 'Recomendado', 
      vCpus: roundToEven(totalThreads / 2),
      vRam: Math.round((physicalRam - hypervisorReserve) * 0.85),
    },
    {
      name: 'Avançado',
      vCpus: totalThreads, // 1:1 ratio
      vRam: physicalRam - hypervisorReserve,
    }
  ];

  return scenarios;
}

// Test with example values: 48 Threads and 32GB RAM
const testThreads = 48;
const testRam = 32;

console.log(`Testing with ${testThreads} Threads and ${testRam}GB RAM:`);
console.log('Expected results:');
console.log('- Otimizado: 12 vCPUs | 16 GB RAM');
console.log('- Recomendado: 24 vCPUs | ~24 GB RAM');
console.log('- Avançado: 48 vCPUs | 28 GB RAM');
console.log('');

const results = calculateScenarios(testThreads, testRam);

console.log('Actual results:');
results.forEach(scenario => {
  console.log(`- ${scenario.name}: ${scenario.vCpus} vCPUs | ${scenario.vRam} GB RAM`);
});

console.log('');
console.log('Calculation details:');
console.log(`Otimizado: vCPU = ${testThreads}/4 = ${testThreads/4} → ${roundToEven(testThreads/4)} (rounded to even)`);
console.log(`Otimizado: vRAM = ${testRam} * 0.5 = ${testRam * 0.5} GB`);
console.log(`Recomendado: vCPU = ${testThreads}/2 = ${testThreads/2} → ${roundToEven(testThreads/2)} (rounded to even)`);
console.log(`Recomendado: vRAM = (${testRam} - 4) * 0.85 = ${(testRam - 4) * 0.85} GB → ${Math.round((testRam - 4) * 0.85)} GB`);
console.log(`Avançado: vCPU = ${testThreads} (1:1 ratio)`);
console.log(`Avançado: vRAM = ${testRam} - 4 = ${testRam - 4} GB`);