// src/components/calculators/DoubleFibraRadioCommissionsSection.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DoubleFibraRadioCommissionsSection: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tabela de Comissões - Double-Fibra/Radio</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Tabela de comissões para produtos Double-Fibra/Radio em desenvolvimento.
                </p>
            </CardContent>
        </Card>
    );
};

export default DoubleFibraRadioCommissionsSection;
