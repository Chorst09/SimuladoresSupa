'use client';

import React from 'react';

export default function PrecisionPricingPage() {
    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Precificação de TI
                </h1>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Sistema de Precificação</h2>
                    <p className="text-gray-300 mb-4">
                        Sistema para cálculo de preços de vendas, locações e serviços de TI.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-600 p-4 rounded">
                            <h3 className="font-semibold">Vendas</h3>
                            <p className="text-sm">Cálculo de preços para vendas</p>
                        </div>
                        <div className="bg-green-600 p-4 rounded">
                            <h3 className="font-semibold">Locação</h3>
                            <p className="text-sm">Cálculo de preços para locações</p>
                        </div>
                        <div className="bg-purple-600 p-4 rounded">
                            <h3 className="font-semibold">Serviços</h3>
                            <p className="text-sm">Cálculo de preços para serviços</p>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Sistema em desenvolvimento - Deploy de teste no Vercel
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}