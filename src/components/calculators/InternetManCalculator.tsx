"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FileText, Calculator, Save, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
import { useCommissions, getCommissionRate, getSellerCommissionRate, getChannelSellerCommissionRate } from '@/hooks/use-commissions';
import CommissionTablesUnified from './CommissionTablesUnified';
import { logError, logSuccess, type LogContext } from '@/lib/logging-utils';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// Interfaces
interface RadioPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    price48: number;
    price60: number;
    installationCost: number;
    manCost: number;
    description: string;
    baseCost: number;
}

interface Product {
    id: string;
    type: 'RADIO';
    description: string;
    setup: number;
    monthly: number;
    details: any;
}

interface Proposal {
    id: string;
    baseId: string;
    version: number;
    client: ClientData;
    clientData?: ClientData; // For backward compatibility
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
    userId: string;
    contractPeriod?: number;
    // Additional fields that may be saved at top level
    applySalespersonDiscount?: boolean;
    appliedDirectorDiscountPercentage?: number;
    includeReferralPartner?: boolean;
    includeInfluencerPartner?: boolean;
    baseTotalMonthly?: number;
    // Enhanced metadata object for complete calculator state
    metadata?: {
        // Core calculator state
        applySalespersonDiscount?: boolean;
        appliedDirectorDiscountPercentage?: number;
        includeReferralPartner?: boolean;
        includeInfluencerPartner?: boolean;
        contractTerm?: number;
        includeInstallation?: boolean;
        selectedSpeed?: number;
        
        // Customer and project state
        isExistingCustomer?: boolean;
        previousMonthly?: number;
        includeLastMile?: boolean;
        lastMileCost?: number;
        projectValue?: number;
        
        // Discount and pricing state
        directorDiscountPercentage?: number;
        taxRates?: {
            pis: number;
            cofins: number;
            csll: number;
            irpj: number;
            banda: number;
            fundraising: number;
            rate: number;
            margem: number;
            custoDesp: number;
        };
        markup?: number;
        estimatedNetMargin?: number;
        
        // UI state that affects calculations
        isEditingTaxes?: boolean;
        
        // Calculated values for verification
        baseTotalMonthly?: number;
        finalTotalSetup?: number;
        finalTotalMonthly?: number;
        referralPartnerCommission?: number;
        influencerPartnerCommission?: number;
        
        // Version tracking and audit trail
        metadataVersion?: number;
        savedAt?: string;
        savedBy?: string;
        calculatorVersion?: string;
        dataStructureVersion?: string;
    };
}

interface InternetManCalculatorProps {
    onBackToDashboard?: () => void;
}

// Enhanced validation functions for proposal data structure
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

const validateProposalStructure = (proposal: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic existence check
    if (!proposal) {
        errors.push('No proposal data provided');
        return { isValid: false, errors, warnings };
    }

    // Type validation
    if (typeof proposal !== 'object') {
        errors.push('Proposal data is not a valid object');
        return { isValid: false, errors, warnings };
    }

    // Required fields validation
    if (!proposal.id) {
        errors.push('Proposal ID is missing');
    }

    // Client data validation
    if (!proposal.clientData && !proposal.client) {
        errors.push('Client information is missing');
    } else {
        // Validate client data structure
        const clientData = proposal.clientData || proposal.client;
        if (typeof clientData === 'object') {
            if (!clientData.name && !clientData.companyName) {
                warnings.push('Client name is missing');
            }
        } else if (typeof clientData === 'string') {
            if (!clientData.trim()) {
                warnings.push('Client name is empty');
            }
        }
    }

    // Account manager validation
    if (!proposal.accountManager) {
        warnings.push('Account manager information is missing');
    } else if (typeof proposal.accountManager === 'object' && !proposal.accountManager.name) {
        warnings.push('Account manager name is missing');
    }

    // Products validation
    if (!proposal.products) {
        errors.push('Products list is missing');
    } else if (!Array.isArray(proposal.products)) {
        errors.push('Products data is not in valid format');
    } else if (proposal.products.length === 0) {
        warnings.push('No products found in proposal');
    } else {
        // Validate individual products
        proposal.products.forEach((product: any, index: number) => {
            if (!product || typeof product !== 'object') {
                errors.push(`Product ${index + 1} has invalid structure`);
            } else {
                if (!product.id) {
                    warnings.push(`Product ${index + 1} is missing ID`);
                }
                if (!product.description) {
                    warnings.push(`Product ${index + 1} is missing description`);
                }
                if (typeof product.setup !== 'number') {
                    errors.push(`Product ${index + 1} has invalid setup cost`);
                }
                if (typeof product.monthly !== 'number') {
                    errors.push(`Product ${index + 1} has invalid monthly cost`);
                }
            }
        });
    }

    // Metadata validation (optional but important for state restoration)
    if (proposal.metadata && typeof proposal.metadata !== 'object') {
        warnings.push('Metadata is present but not in valid format');
    }

    // Financial data validation
    if (proposal.totalSetup !== undefined && typeof proposal.totalSetup !== 'number') {
        warnings.push('Total setup cost is not a valid number');
    }
    if (proposal.totalMonthly !== undefined && typeof proposal.totalMonthly !== 'number') {
        warnings.push('Total monthly cost is not a valid number');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

const createUserFriendlyErrorMessage = (errors: string[]): string => {
    if (errors.length === 0) {
        return 'Erro desconhecido ao carregar proposta.';
    }

    let message = 'Não foi possível carregar a proposta devido aos seguintes problemas:\n\n';
    
    errors.forEach((error, index) => {
        message += `${index + 1}. ${translateErrorToPortuguese(error)}\n`;
    });

    message += '\nVocê pode:\n';
    message += '• Tentar criar uma nova proposta\n';
    message += '• Verificar se a proposta foi salva corretamente\n';
    message += '• Contatar o suporte técnico se o problema persistir';

    return message;
};

const translateErrorToPortuguese = (error: string): string => {
    const translations: Record<string, string> = {
        'No proposal data provided': 'Nenhum dado de proposta foi fornecido',
        'Proposal data is not a valid object': 'Os dados da proposta estão em formato inválido',
        'Proposal ID is missing': 'ID da proposta não encontrado',
        'Client information is missing': 'Informações do cliente estão ausentes',
        'Products list is missing': 'Lista de produtos não encontrada',
        'Products data is not in valid format': 'Dados dos produtos estão em formato inválido'
    };

    // Check for pattern matches
    if (error.includes('Product') && error.includes('invalid structure')) {
        return error.replace('Product', 'Produto').replace('has invalid structure', 'tem estrutura inválida');
    }
    if (error.includes('Product') && error.includes('invalid setup cost')) {
        return error.replace('Product', 'Produto').replace('has invalid setup cost', 'tem custo de instalação inválido');
    }
    if (error.includes('Product') && error.includes('invalid monthly cost')) {
        return error.replace('Product', 'Produto').replace('has invalid monthly cost', 'tem custo mensal inválido');
    }

    return translations[error] || error;
};

// Enhanced error classification for proposal editing
interface EditProposalErrorInfo {
    errorMessage: string;
    recoveryGuidance: string;
    canContinue: boolean;
}

const classifyEditProposalError = (error: any): EditProposalErrorInfo => {
    const errorMessage = error?.message || error?.toString() || '';
    const errorType = error?.constructor?.name || 'Unknown';

    // Type-specific error handling
    if (error instanceof TypeError) {
        return {
            errorMessage: 'Erro de formato nos dados da proposta.',
            recoveryGuidance: 'Os dados podem estar corrompidos ou em formato incompatível. Verifique se a proposta foi salva corretamente.',
            canContinue: true
        };
    }

    if (error instanceof ReferenceError) {
        return {
            errorMessage: 'Referência de dados não encontrada.',
            recoveryGuidance: 'Alguns campos obrigatórios podem estar ausentes. O sistema tentará usar valores padrão.',
            canContinue: true
        };
    }

    if (error instanceof SyntaxError) {
        return {
            errorMessage: 'Estrutura de dados corrompida.',
            recoveryGuidance: 'A proposta pode ter sido salva com erro. Recomendamos criar uma nova proposta.',
            canContinue: false
        };
    }

    // Message-based error classification
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        return {
            errorMessage: 'Erro ao processar dados da proposta.',
            recoveryGuidance: 'Os dados estão em formato inválido. Tente criar uma nova proposta.',
            canContinue: false
        };
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        return {
            errorMessage: 'Erro de conexão ao carregar proposta.',
            recoveryGuidance: 'Verifique sua conexão com a internet e tente novamente.',
            canContinue: true
        };
    }

    if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        return {
            errorMessage: 'Sem permissão para acessar esta proposta.',
            recoveryGuidance: 'Verifique se você tem permissão para editar esta proposta.',
            canContinue: false
        };
    }

    // Default error handling
    return {
        errorMessage: 'Erro inesperado ao carregar proposta.',
        recoveryGuidance: 'Tente novamente em alguns instantes. Se o problema persistir, contate o suporte técnico.',
        canContinue: true
    };
};

// Data recovery interface
interface RecoveryResult {
    success: boolean;
    recoveredData: {
        clientData: ClientData;
        accountManagerData: AccountManagerData;
        products: Product[];
        calculatorState: Partial<{
            applySalespersonDiscount: boolean;
            appliedDirectorDiscountPercentage: number;
            contractTerm: number;
            includeInstallation: boolean;
            selectedSpeed: number;
            includeReferralPartner: boolean;
            includeInfluencerPartner: boolean;
        }>;
    };
    error?: any;
}

const attemptProposalDataRecovery = (proposal: any): RecoveryResult => {
    try {
        console.log('🔄 Attempting proposal data recovery...');

        // Initialize with safe defaults
        const recoveredData = {
            clientData: { name: '', contact: '', projectName: '', email: '', phone: '' } as ClientData,
            accountManagerData: { name: '', email: '', phone: '' } as AccountManagerData,
            products: [] as Product[],
            calculatorState: {}
        };

        // Attempt client data recovery
        try {
            if (proposal?.clientData && typeof proposal.clientData === 'object') {
                recoveredData.clientData = {
                    name: proposal.clientData.name || '',
                    contact: proposal.clientData.contact || '',
                    projectName: proposal.clientData.projectName || '',
                    email: proposal.clientData.email || '',
                    phone: proposal.clientData.phone || '',
                    companyName: (proposal.clientData as any).companyName || '',
                    address: (proposal.clientData as any).address || '',
                    cnpj: (proposal.clientData as any).cnpj || ''
                };
                console.log('✅ Client data recovered from clientData field');
            } else if (proposal?.client) {
                if (typeof proposal.client === 'object') {
                    recoveredData.clientData = {
                        name: (proposal.client as any).name || '',
                        contact: (proposal.client as any).contact || '',
                        projectName: (proposal.client as any).projectName || '',
                        email: (proposal.client as any).email || '',
                        phone: (proposal.client as any).phone || '',
                        companyName: (proposal.client as any).companyName || '',
                        address: (proposal.client as any).address || '',
                        cnpj: (proposal.client as any).cnpj || ''
                    };
                    console.log('✅ Client data recovered from client object');
                } else if (typeof proposal.client === 'string') {
                    recoveredData.clientData.name = proposal.client;
                    recoveredData.clientData.companyName = proposal.client;
                    console.log('✅ Client data recovered from client string');
                }
            }
        } catch (clientError) {
            console.warn('⚠️ Client data recovery failed:', clientError);
        }

        // Attempt account manager recovery
        try {
            if (proposal?.accountManager && typeof proposal.accountManager === 'object') {
                recoveredData.accountManagerData = {
                    name: proposal.accountManager.name || '',
                    email: proposal.accountManager.email || '',
                    phone: proposal.accountManager.phone || '',
                    department: (proposal.accountManager as any).department || '',
                    role: (proposal.accountManager as any).role || ''
                };
                console.log('✅ Account manager data recovered');
            } else if (typeof proposal.accountManager === 'string') {
                recoveredData.accountManagerData.name = proposal.accountManager;
                console.log('✅ Account manager name recovered from string');
            }
        } catch (accountManagerError) {
            console.warn('⚠️ Account manager data recovery failed:', accountManagerError);
        }

        // Attempt products recovery
        try {
            if (proposal?.products && Array.isArray(proposal.products)) {
                const validProducts = proposal.products.filter((product: any) => {
                    return product && 
                           typeof product === 'object' && 
                           product.id && 
                           product.description &&
                           typeof product.setup === 'number' &&
                           typeof product.monthly === 'number';
                });

                if (validProducts.length > 0) {
                    recoveredData.products = [...validProducts];
                    console.log(`✅ ${validProducts.length} products recovered`);
                }
            }
        } catch (productsError) {
            console.warn('⚠️ Products recovery failed:', productsError);
        }

        // Attempt calculator state recovery
        try {
            const metadata = proposal?.metadata;
            if (metadata && typeof metadata === 'object') {
                recoveredData.calculatorState = {
                    applySalespersonDiscount: metadata.applySalespersonDiscount || false,
                    appliedDirectorDiscountPercentage: metadata.appliedDirectorDiscountPercentage || 0,
                    contractTerm: metadata.contractTerm || 12,
                    includeInstallation: metadata.includeInstallation !== false,
                    selectedSpeed: metadata.selectedSpeed || 0,
                    includeReferralPartner: metadata.includeReferralPartner || false,
                    includeInfluencerPartner: metadata.includeInfluencerPartner || false
                };
                console.log('✅ Calculator state recovered from metadata');
            } else {
                // Try to recover from top-level fields
                recoveredData.calculatorState = {
                    applySalespersonDiscount: (proposal as any)?.applySalespersonDiscount || false,
                    appliedDirectorDiscountPercentage: (proposal as any)?.appliedDirectorDiscountPercentage || 0,
                    contractTerm: proposal?.contractPeriod || 12,
                    includeInstallation: true,
                    selectedSpeed: 0,
                    includeReferralPartner: (proposal as any)?.includeReferralPartner || false,
                    includeInfluencerPartner: (proposal as any)?.includeInfluencerPartner || false
                };
                console.log('✅ Calculator state recovered from top-level fields');
            }
        } catch (calculatorStateError) {
            console.warn('⚠️ Calculator state recovery failed:', calculatorStateError);
        }

        console.log('🎉 Data recovery completed successfully');
        return { success: true, recoveredData };

    } catch (recoveryError) {
        console.error('❌ Data recovery failed completely:', recoveryError);
        return { 
            success: false, 
            recoveredData: {
                clientData: { name: '', contact: '', projectName: '', email: '', phone: '' },
                accountManagerData: { name: '', email: '', phone: '' },
                products: [],
                calculatorState: {}
            },
            error: recoveryError 
        };
    }
};

// Apply calculator state with fallback to defaults
const applyCalculatorStateWithFallback = (calculatorState: any) => {
    try {
        // Apply each state with individual error handling
        const stateSetters = [
            { setter: setApplySalespersonDiscount, value: calculatorState.applySalespersonDiscount, default: false },
            { setter: setAppliedDirectorDiscountPercentage, value: calculatorState.appliedDirectorDiscountPercentage, default: 0 },
            { setter: setContractTerm, value: calculatorState.contractTerm, default: 12 },
            { setter: setIncludeInstallation, value: calculatorState.includeInstallation, default: true },
            { setter: setSelectedSpeed, value: calculatorState.selectedSpeed, default: 0 },
            { setter: setIncludeReferralPartner, value: calculatorState.includeReferralPartner, default: false },
            { setter: setIncludeInfluencerPartner, value: calculatorState.includeInfluencerPartner, default: false }
        ];

        stateSetters.forEach(({ setter, value, default: defaultValue }) => {
            try {
                setter(value !== undefined ? value : defaultValue);
            } catch (setterError) {
                console.warn('Error setting calculator state, using default:', setterError);
                setter(defaultValue);
            }
        });

        // Set additional states to safe defaults
        setIsExistingCustomer(false);
        setPreviousMonthly(0);
        setIncludeLastMile(false);
        setLastMileCost(0);
        setProjectValue(0);
        setDirectorDiscountPercentage(0);
        setTaxRates({ pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 });
        setMarkup(100);
        setEstimatedNetMargin(0);
        setIsEditingTaxes(false);

        console.log('✅ Calculator state applied with fallback');
    } catch (error) {
        console.error('❌ Failed to apply calculator state, using all defaults:', error);
        
        // Apply all defaults as last resort
        setApplySalespersonDiscount(false);
        setAppliedDirectorDiscountPercentage(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setSelectedSpeed(0);
        setIncludeReferralPartner(false);
        setIncludeInfluencerPartner(false);
        setIsExistingCustomer(false);
        setPreviousMonthly(0);
        setIncludeLastMile(false);
        setLastMileCost(0);
        setProjectValue(0);
        setDirectorDiscountPercentage(0);
        setTaxRates({ pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 });
        setMarkup(100);
        setEstimatedNetMargin(0);
        setIsEditingTaxes(false);
    }
};

// Create user-friendly warning for partial data loading
const createPartialLoadingWarning = (clientLoaded: boolean, accountManagerLoaded: boolean, productsLoaded: boolean): string | null => {
    const issues: string[] = [];
    
    if (!clientLoaded) {
        issues.push('• Dados do cliente podem estar incompletos');
    }
    if (!accountManagerLoaded) {
        issues.push('• Informações do gerente de contas podem estar ausentes');
    }
    if (!productsLoaded) {
        issues.push('• Lista de produtos pode estar vazia ou corrompida');
    }
    
    if (issues.length === 0) {
        return null;
    }
    
    return `Atenção: Alguns dados da proposta não puderam ser carregados completamente:\n\n${issues.join('\n')}\n\nO sistema usou valores padrão onde necessário.`;
};



// Email validation helper
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Error classification for save proposal errors
interface SaveProposalErrorInfo {
    errorMessage: string;
    recoveryGuidance: string;
    canRetry: boolean;
}

const classifySaveProposalError = (error: any): SaveProposalErrorInfo => {
    const errorMessage = error?.message || error?.toString() || '';
    const errorType = error?.constructor?.name || 'Unknown';

    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        return {
            errorMessage: 'Erro de conexão ao salvar proposta.',
            recoveryGuidance: 'Verifique sua conexão com a internet.',
            canRetry: true
        };
    }

    // Authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
        return {
            errorMessage: 'Sessão expirada ou não autorizada.',
            recoveryGuidance: 'Faça login novamente e tente salvar.',
            canRetry: true
        };
    }

    // Permission errors
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        return {
            errorMessage: 'Sem permissão para salvar propostas.',
            recoveryGuidance: 'Verifique suas permissões com o administrador.',
            canRetry: false
        };
    }

    // Server errors
    if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        return {
            errorMessage: 'Erro interno do servidor.',
            recoveryGuidance: 'Tente novamente em alguns instantes. Se persistir, contate o suporte.',
            canRetry: true
        };
    }

    // Quota/limit errors
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return {
            errorMessage: 'Limite de requisições excedido.',
            recoveryGuidance: 'Aguarde alguns minutos antes de tentar novamente.',
            canRetry: true
        };
    }

    // Data validation errors
    if (errorMessage.includes('400') || errorMessage.includes('Bad Request') || errorMessage.includes('validation')) {
        return {
            errorMessage: 'Dados da proposta inválidos.',
            recoveryGuidance: 'Verifique se todos os campos estão preenchidos corretamente.',
            canRetry: true
        };
    }

    // JSON/parsing errors
    if (errorMessage.includes('JSON') || errorMessage.includes('parse') || errorMessage.includes('SyntaxError')) {
        return {
            errorMessage: 'Erro no formato dos dados.',
            recoveryGuidance: 'Os dados podem estar corrompidos. Tente recarregar a página.',
            canRetry: false
        };
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('TimeoutError')) {
        return {
            errorMessage: 'Tempo limite excedido ao salvar.',
            recoveryGuidance: 'A operação demorou muito. Tente novamente.',
            canRetry: true
        };
    }

    // Default error handling
    return {
        errorMessage: 'Erro inesperado ao salvar proposta.',
        recoveryGuidance: 'Verifique os dados e tente novamente. Se o problema persistir, contate o suporte técnico.',
        canRetry: true
    };
};

const InternetManCalculator: React.FC<InternetManCalculatorProps> = ({ onBackToDashboard }) => {
    const { user } = useAuth();

    // Estados
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [clientData, setClientData] = useState<ClientData>({ name: '', contact: '', projectName: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });
    
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [radioPlans, setRadioPlans] = useState<RadioPlan[]>([]);

    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    
    const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
    const [previousMonthly, setPreviousMonthly] = useState<number>(0);
    const [includeLastMile, setIncludeLastMile] = useState<boolean>(false);
    const [lastMileCost, setLastMileCost] = useState<number>(0);
    const [projectValue, setProjectValue] = useState<number>(0);

    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0); // New state for applied director discount
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false); // New state
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    const [includeInfluencerPartner, setIncludeInfluencerPartner] = useState<boolean>(false);
    const [taxRates, setTaxRates] = useState({ pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 });
    const [isEditingTaxes, setIsEditingTaxes] = useState(false);
    const [markup, setMarkup] = useState(100);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState(0);

    // Validation function for saving proposals
    const validateProposalForSaving = (user: any, clientData: ClientData, accountManagerData: AccountManagerData, addedProducts: Product[], contractTerm: number, appliedDirectorDiscountPercentage: number): ValidationResult => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // User authentication check
        if (!user) {
            errors.push('• Usuário não autenticado');
            return { isValid: false, errors, warnings };
        }

        // Client data validation
        if (!clientData || !clientData.name?.trim()) {
            errors.push('• Nome do cliente é obrigatório');
        }
        if (clientData?.email && !isValidEmail(clientData.email)) {
            warnings.push('• Email do cliente parece inválido');
        }

        // Account manager validation
        if (!accountManagerData || !accountManagerData.name?.trim()) {
            errors.push('• Nome do gerente de contas é obrigatório');
        }
        if (accountManagerData?.email && !isValidEmail(accountManagerData.email)) {
            warnings.push('• Email do gerente de contas parece inválido');
        }

        // Products validation
        if (!addedProducts || addedProducts.length === 0) {
            errors.push('• Pelo menos um produto deve ser adicionado');
        } else {
            // Validate individual products
            addedProducts.forEach((product, index) => {
                if (!product.description?.trim()) {
                    warnings.push(`• Produto ${index + 1} não tem descrição`);
                }
                if (product.setup < 0) {
                    errors.push(`• Produto ${index + 1} tem custo de instalação inválido`);
                }
                if (product.monthly <= 0) {
                    errors.push(`• Produto ${index + 1} tem custo mensal inválido`);
                }
            });
        }

        // Financial validation
        const totalSetup = addedProducts.reduce((sum, p) => sum + (p.setup || 0), 0);
        const totalMonthly = addedProducts.reduce((sum, p) => sum + (p.monthly || 0), 0);
        
        if (totalMonthly <= 0) {
            errors.push('• Total mensal deve ser maior que zero');
        }
        
        if (totalSetup < 0) {
            errors.push('• Total de instalação não pode ser negativo');
        }

        // Contract term validation
        if (contractTerm < 12 || contractTerm > 60) {
            warnings.push('• Prazo do contrato fora do intervalo recomendado (12-60 meses)');
        }

        // Discount validation
        if (appliedDirectorDiscountPercentage < 0 || appliedDirectorDiscountPercentage > 50) {
            warnings.push('• Desconto do diretor fora do intervalo recomendado (0-50%)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    };

    // Função para atualizar as taxas de impostos
    const handleTaxRateChange = (taxType: string, value: string) => {
        const newValue = parseFloat(value) || 0;
        setTaxRates(prev => ({
            ...prev,
            [taxType]: newValue
        }));
    };

    // Efeitos


    const fetchProposals = React.useCallback(async () => {
        if (!user || !user.role) {
            setProposals([]);
            return;
        }

        const requestId = `fetch_${Date.now()}`;
        const logContext: LogContext = {
            operation: 'fetchProposals',
            userId: user.id,
            requestId
        };

        try {
            console.log('🔄 Fetching proposals...');
            
            const response = await fetch('/api/proposals', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (response.ok) {
                const proposalsData = await response.json();
                
                // Validate proposals data structure
                if (!Array.isArray(proposalsData)) {
                    throw new Error('Invalid proposals data format received from server');
                }
                
                // Filter for MAN proposals with validation
                const manProposals = proposalsData.filter((p: any) => {
                    try {
                        return (p.type === 'MAN' || p.baseId?.startsWith('Prop_InterMan_')) && 
                               p.id && 
                               typeof p === 'object';
                    } catch (filterError) {
                        console.warn('Invalid proposal data filtered out:', p, filterError);
                        return false;
                    }
                });
                
                setProposals(manProposals);
                
                // Log successful fetch
                logSuccess('Proposals fetched successfully', logContext, {
                    resultCount: manProposals.length,
                    duration: Date.now() - parseInt(requestId.split('_')[1])
                });
                
                console.log(`✅ ${manProposals.length} MAN proposals loaded successfully`);
                
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
            
            // Log error with structured logging
            logError('Failed to fetch proposals', error, logContext, {
                severity: 'MEDIUM',
                suggestedActions: [
                    'Check network connection',
                    'Verify authentication token',
                    'Try refreshing the page',
                    'Contact support if issue persists'
                ]
            });
            
            setProposals([]);
            
            // Show user-friendly error message
            const errorMessage = error?.message || 'Erro desconhecido';
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                console.warn('⚠️ Network error detected, user may need to check connection');
            } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
                console.warn('⚠️ Authentication error detected, user may need to login again');
            }
        }
    }, [user]);

    useEffect(() => {
        const initialRadioPlans: RadioPlan[] = [
            { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, price48: 474.00, price60: 474.00, installationCost: 998.00, manCost: 3500.00, description: "25 Mbps", baseCost: 0 },
            { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, price48: 500.65, price60: 474.30, installationCost: 998.00, manCost: 3500.00, description: "30 Mbps", baseCost: 0 },
            { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, price48: 550.05, price60: 521.10, installationCost: 998.00, manCost: 3500.00, description: "40 Mbps", baseCost: 0 },
            { speed: 50, price12: 1103.39, price24: 685.00, price36: 632.00, price48: 600.40, price60: 568.80, installationCost: 998.00, manCost: 3500.00, description: "50 Mbps", baseCost: 0 },
            { speed: 60, price12: 1547.44, price24: 790.00, price36: 737.00, price48: 700.15, price60: 663.30, installationCost: 998.00, manCost: 3500.00, description: "60 Mbps", baseCost: 0 },
            { speed: 80, price12: 1825.98, price24: 1000.00, price36: 948.00, price48: 900.60, price60: 853.20, installationCost: 998.00, manCost: 7000.00, description: "80 Mbps", baseCost: 0 },
            { speed: 100, price12: 2017.05, price24: 1578.00, price36: 1316.00, price48: 1250.20, price60: 1184.40, installationCost: 1996.00, manCost: 7000.00, description: "100 Mbps", baseCost: 0 },
            { speed: 150, price12: 2543.18, price24: 1789.00, price36: 1527.00, price48: 1450.65, price60: 1374.30, installationCost: 1996.00, manCost: 7000.00, description: "150 Mbps", baseCost: 0 },
            { speed: 200, price12: 3215.98, price24: 2053.00, price36: 1737.00, price48: 1650.15, price60: 1563.30, installationCost: 1996.00, manCost: 7000.00, description: "200 Mbps", baseCost: 0 },
            { speed: 300, price12: 7522.00, price24: 4316.00, price36: 4000.00, price48: 3800.00, price60: 3600.00, installationCost: 2500.00, manCost: 7000.00, description: "300 Mbps", baseCost: 0 },
            { speed: 400, price12: 9469.00, price24: 5211.00, price36: 4736.00, price48: 4499.20, price60: 4262.40, installationCost: 2500.00, manCost: 7000.00, description: "400 Mbps", baseCost: 0 },
            { speed: 500, price12: 11174.00, price24: 5789.00, price36: 5253.00, price48: 4990.35, price60: 4727.70, installationCost: 2500.00, manCost: 7000.00, description: "500 Mbps", baseCost: 0 },
            { speed: 600, price12: 12500.00, price24: 6315.00, price36: 5790.00, price48: 5500.50, price60: 5211.00, installationCost: 2500.00, manCost: 7000.00, description: "600 Mbps", baseCost: 0 },
            { speed: 700, price12: 13800.00, price24: 6900.00, price36: 6300.00, price48: 5985.00, price60: 5670.00, installationCost: 2500.00, manCost: 7000.00, description: "700 Mbps", baseCost: 0 },
            { speed: 800, price12: 15000.00, price24: 7500.00, price36: 6800.00, price48: 6460.00, price60: 6120.00, installationCost: 2500.00, manCost: 7000.00, description: "800 Mbps", baseCost: 0 },
            { speed: 900, price12: 16200.00, price24: 8100.00, price36: 7300.00, price48: 6935.00, price60: 6570.00, installationCost: 2500.00, manCost: 7000.00, description: "900 Mbps", baseCost: 0 },
            { speed: 1000, price12: 17500.00, price24: 8750.00, price36: 7900.00, price48: 7505.00, price60: 7110.00, installationCost: 2500.00, manCost: 7000.00, description: "1000 Mbps (1 Gbps)", baseCost: 0 }
        ];
        const savedPlans = localStorage.getItem('radioLinkPrices');
        if (savedPlans) {
            try {
                const plans = JSON.parse(savedPlans);
                if (Array.isArray(plans)) {
                    // Adicionar manCost aos planos antigos que não têm essa propriedade
                    const updatedPlans = plans.map((plan: RadioPlan) => ({
                        ...plan,
                        manCost: plan.manCost || 0
                    }));
                    setRadioPlans(updatedPlans);
                } else {
                    setRadioPlans(initialRadioPlans);
                }
            } catch (e) {
                console.error("Error parsing radio plans from localStorage", e);
                setRadioPlans(initialRadioPlans);
            }
        } else {
            setRadioPlans(initialRadioPlans);
        }

        fetchProposals();
    }, [fetchProposals]);

    useEffect(() => {
        if (proposals.length > 0) {
            localStorage.setItem('radioProposals', JSON.stringify(proposals));
        }
    }, [proposals]);

    const { channelIndicator, channelInfluencer, channelSeller, seller, isLoading: isLoadingCommissions } = useCommissions();

    const getPartnerIndicatorRate = (monthlyRevenue: number, contractMonths: number): number => {
        return getCommissionRate(channelIndicator, monthlyRevenue, contractMonths);
    };

    const getPartnerInfluencerRate = (monthlyRevenue: number, contractMonths: number): number => {
        return getCommissionRate(channelInfluencer, monthlyRevenue, contractMonths);
    };

    // Funções
    const generateUniqueId = () => `PROP-${Date.now()}`;

    const handlePriceChange = (index: number, field: keyof Omit<RadioPlan, 'description' | 'baseCost' | 'speed'>, value: string) => {
        const newPlans = [...radioPlans];
        const numericValue = parseFloat(value.replace(/[^0-9,.]+/g, "").replace(",", "."));
        if (!isNaN(numericValue)) {
            (newPlans[index] as any)[field] = numericValue;
            setRadioPlans(newPlans);
        }
    };

    const handleSavePrices = () => {
        localStorage.setItem('radioLinkPrices', JSON.stringify(radioPlans));
        alert('Preços da tabela Rádio salvos com sucesso!');
    };

    const totalSetup = (addedProducts || []).reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = (addedProducts || []).reduce((sum, p) => sum + p.monthly, 0);

    const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1;
    
    const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

    const referralPartnerCommission = (() => {
        if (!includeReferralPartner) return 0;
        const monthlyRevenue = totalMonthly * salespersonDiscountFactor * directorDiscountFactor;
        // Corrigindo o cálculo da comissão do Canal Indicador
        const rate = 0.05; // Taxa fixa de 5% para Canal Indicador
        return monthlyRevenue * rate;
    })();

    const influencerPartnerCommission = (() => {
        if (!includeInfluencerPartner) return 0;
        const monthlyRevenue = totalMonthly * salespersonDiscountFactor * directorDiscountFactor;
        // Corrigindo o cálculo da comissão do Canal Influenciador
        const rate = 0.03; // Taxa fixa de 3% para Canal Influenciador
        return monthlyRevenue * rate;
    })();

    // Setup costs should NOT be discounted - they remain at full price
    const finalTotalSetup = totalSetup;
    // Only monthly totals should have discounts applied
    const finalTotalMonthly = (totalMonthly * salespersonDiscountFactor * directorDiscountFactor) - referralPartnerCommission - influencerPartnerCommission;

    const handleClientFormSubmit = () => {
        console.log('Client data already set:', clientData);
        console.log('Account manager data already set:', accountManagerData);
        setViewMode('calculator');
    };

    const cancelAction = () => {
        setViewMode('search');
    };

    const getMonthlyPrice = (plan: RadioPlan, term: number) => {
        switch (term) {
            case 12: return plan.price12;
            case 24: return plan.price24;
            case 36: return plan.price36;
            case 48: return plan.price48;
            case 60: return plan.price60;
            default: return plan.price12;
        }
    };

    const getMaxPaybackMonths = (contractTerm: number): number => {
        // Returns the maximum allowed payback period for each contract term
        switch (contractTerm) {
            case 12: return 8;
            case 24: return 10;
            case 36: return 11;
            case 48: return 13;
            case 60: return 14;
            default: return 8;
        }
    };

    const calculatePayback = (installationCost: number, monthlyRevenue: number): number => {
        // Calculate payback in months
        if (monthlyRevenue <= 0) return 0;
        return Math.ceil(installationCost / monthlyRevenue);
    };

    const validatePayback = (installationCost: number, monthlyRevenue: number, contractTerm: number): { isValid: boolean, actualPayback: number, maxPayback: number } => {
        const actualPayback = calculatePayback(installationCost, monthlyRevenue);
        const maxPayback = getMaxPaybackMonths(contractTerm);
        
        return {
            isValid: actualPayback <= maxPayback,
            actualPayback,
            maxPayback
        };
    };

    const handleAddProduct = () => {
        if (!selectedSpeed) return;
        
        const plan = radioPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        const setupCost = includeInstallation ? plan.installationCost : 0;

        const newProduct: Product = {
            id: Date.now().toString(),
            type: 'RADIO',
            description: `${plan.speed} Mbps - ${contractTerm} meses`,
            setup: setupCost,
            monthly: monthlyPrice,
            details: {
                speed: plan.speed,
                term: contractTerm,
                includeInstallation
            }
        };

        setAddedProducts(prev => [...(prev || []), newProduct]);
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(addedProducts.filter(p => p.id !== id));
    };

    // Função para determinar a versão baseada nos descontos aplicados
    const getProposalVersion = (): number => {
        if (appliedDirectorDiscountPercentage > 0) {
            return 3; // V3 para desconto do diretor
        } else if (applySalespersonDiscount) {
            return 2; // V2 para desconto do vendedor
        }
        return 1; // V1 versão base
    };

    // Função para aplicar descontos no total mensal
    const applyDiscounts = (baseTotal: number): number => {
        let discountedTotal = baseTotal;
        
        // Aplicar desconto do vendedor (5%)
        if (applySalespersonDiscount) {
            discountedTotal = discountedTotal * 0.95;
        }
        
        // Aplicar desconto do diretor (percentual configurado)
        if (appliedDirectorDiscountPercentage > 0) {
            const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);
            discountedTotal = discountedTotal * directorDiscountFactor;
        }
        
        return discountedTotal;
    };

    // Enhanced proposal saving function with comprehensive validation and error handling
    const saveProposal = async () => {
        const requestId = `save_${Date.now()}`;
        const logContext: LogContext = {
            operation: 'saveProposal',
            userId: user?.id,
            requestId
        };

        // Enhanced validation with detailed error messages
        const validationResult = validateProposalForSaving(user, clientData, accountManagerData, addedProducts, contractTerm, appliedDirectorDiscountPercentage);
        if (!validationResult.isValid) {
            const errorMessage = `Não é possível salvar a proposta:\n\n${validationResult.errors.join('\n')}`;
            alert(errorMessage);
            
            // Log validation errors
            logError('Proposal validation failed before saving', new Error(validationResult.errors.join('; ')), logContext, {
                severity: 'LOW',
                suggestedActions: ['Complete required fields', 'Add at least one product']
            });
            
            return;
        }

        try {
            console.log('🔄 Starting proposal save process...');
            
            const baseTotalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
            const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
            
            // Aplicar descontos no total mensal
            const finalTotalMonthly = applyDiscounts(baseTotalMonthly);
            const proposalVersion = getProposalVersion();

            // Enhanced metadata with complete calculator state
            const currentTimestamp = new Date().toISOString();
            const completeMetadata = {
                // Core calculator state
                applySalespersonDiscount: applySalespersonDiscount,
                appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage,
                includeReferralPartner: includeReferralPartner,
                includeInfluencerPartner: includeInfluencerPartner,
                contractTerm: contractTerm,
                includeInstallation: includeInstallation,
                selectedSpeed: selectedSpeed,
                
                // Customer and project state
                isExistingCustomer: isExistingCustomer,
                previousMonthly: previousMonthly,
                includeLastMile: includeLastMile,
                lastMileCost: lastMileCost,
                projectValue: projectValue,
                
                // Discount and pricing state
                directorDiscountPercentage: directorDiscountPercentage,
                taxRates: {
                    pis: taxRates.pis,
                    cofins: taxRates.cofins,
                    csll: taxRates.csll,
                    irpj: taxRates.irpj,
                    banda: taxRates.banda,
                    fundraising: taxRates.fundraising,
                    rate: taxRates.rate,
                    margem: taxRates.margem,
                    custoDesp: taxRates.custoDesp
                },
                markup: markup,
                estimatedNetMargin: estimatedNetMargin,
                
                // UI state that affects calculations
                isEditingTaxes: isEditingTaxes,
                
                // Calculated values for verification
                baseTotalMonthly: baseTotalMonthly,
                finalTotalSetup: totalSetup,
                finalTotalMonthly: finalTotalMonthly,
                referralPartnerCommission: referralPartnerCommission,
                influencerPartnerCommission: influencerPartnerCommission,
                
                // Version tracking for data structure changes
                metadataVersion: 2, // Incremented to indicate enhanced metadata structure
                savedAt: currentTimestamp,
                savedBy: user.email || user.id,
                
                // Additional context for debugging and auditing
                calculatorVersion: 'InternetManCalculator_v2.0',
                dataStructureVersion: '2024-01-01'
            };

            const proposalToSave = {
                title: `Proposta Internet Man V${proposalVersion} - ${clientData.companyName || clientData.name || 'Cliente'}`,
                client: clientData.companyName || clientData.name || 'Cliente não informado',
                value: finalTotalMonthly,
                type: 'MAN',
                status: 'Rascunho',
                createdBy: user.email || user.id,
                createdAt: currentTimestamp,
                version: proposalVersion,
                contractPeriod: contractTerm,
                
                // Store additional data as top-level fields for backward compatibility
                clientData: clientData,
                accountManager: accountManagerData,
                products: addedProducts,
                totalSetup: totalSetup,
                totalMonthly: finalTotalMonthly,
                baseTotalMonthly: baseTotalMonthly,
                applySalespersonDiscount: applySalespersonDiscount,
                appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage,
                includeReferralPartner: includeReferralPartner,
                includeInfluencerPartner: includeInfluencerPartner,
                userId: user.id,
                
                // Store complete calculator state in enhanced metadata structure
                metadata: completeMetadata
            };

            console.log('Saving proposal with enhanced metadata:', {
                proposalId: proposalToSave.title,
                metadataVersion: completeMetadata.metadataVersion,
                stateVariableCount: Object.keys(completeMetadata).length,
                timestamp: currentTimestamp
            });

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(proposalToSave),
            });

            if (response.ok) {
                const savedProposal = await response.json();
                
                // Log successful save
                logSuccess('Proposal saved successfully', logContext, {
                    duration: Date.now() - parseInt(requestId.split('_')[1]),
                    resultCount: 1
                });
                
                console.log('✅ Proposal saved successfully with enhanced metadata:', savedProposal.id);
                alert(`Proposta ${savedProposal.id} salva com sucesso!`);
                setCurrentProposal(savedProposal);
                fetchProposals();
                setViewMode('search');
            } else {
                const errorText = await response.text();
                const errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Erro ao salvar proposta:', error);
            
            // Enhanced error handling with classification
            const { errorMessage, recoveryGuidance, canRetry } = classifySaveProposalError(error);
            
            // Log error with structured logging
            logError('Failed to save proposal', error, logContext, {
                severity: 'HIGH',
                suggestedActions: canRetry ? 
                    ['Try saving again', 'Check network connection', 'Verify data integrity'] :
                    ['Check data format', 'Contact support', 'Try creating new proposal']
            });
            
            const fullErrorMessage = `${errorMessage}\n\n${recoveryGuidance}${canRetry ? '\n\nTente salvar novamente.' : ''}`;
            alert(fullErrorMessage);
        }
    };

    const handlePrint = () => {
        // Add print-specific styles
        const printStyles = `
            @media print {
                @page {
                    size: A4;
                    margin: 1cm;
                }
                
                body * {
                    visibility: hidden;
                }
                
                .print-area, .print-area * {
                    visibility: visible;
                }
                
                .print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white !important;
                }
                
                .no-print {
                    display: none !important;
                }
                
                .print\\:block {
                    display: block !important;
                }
                
                .print\\:hidden {
                    display: none !important;
                }
                
                .print\\:pt-2 {
                    padding-top: 0.5rem !important;
                }
                
                .print\\:gap-4 {
                    gap: 1rem !important;
                }
                
                .print\\:space-y-4 > * + * {
                    margin-top: 1rem !important;
                }
                
                .print\\:text-sm {
                    font-size: 0.875rem !important;
                }
                
                table {
                    page-break-inside: avoid;
                }
                
                .border, .border-t {
                    border-color: #000 !important;
                }
                
                .text-gray-900 {
                    color: #000 !important;
                }
                
                .bg-slate-50 {
                    background-color: #f8fafc !important;
                }
            }
        `;
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.textContent = printStyles;
        document.head.appendChild(styleElement);
        
        // Add print-area class to the proposal view
        const proposalElement = document.querySelector('.proposal-view');
        if (proposalElement) {
            proposalElement.classList.add('print-area');
        }
        
        // Trigger print
        window.print();
        
        // Clean up
        setTimeout(() => {
            document.head.removeChild(styleElement);
            if (proposalElement) {
                proposalElement.classList.remove('print-area');
            }
        }, 1000);
    };

    const rawTotalMonthly = (addedProducts || []).reduce((sum, p) => sum + p.monthly, 0);

    const filteredProposals = proposals.filter(proposal => 
        proposal.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewProposal = (proposal: Proposal) => {
        try {
            console.log('🔄 Loading proposal for viewing:', proposal?.id);
            
            // Validate proposal structure before viewing
            const validationResult = validateProposalStructure(proposal);
            if (!validationResult.isValid) {
                console.error('Proposal validation failed for viewing:', validationResult.errors);
                alert(`Não é possível visualizar a proposta:\n\n${validationResult.errors.join('\n')}`);
                return;
            }

            // Log warnings if any
            if (validationResult.warnings.length > 0) {
                console.warn('Proposal viewing warnings:', validationResult.warnings);
            }

            setCurrentProposal(proposal);
            
            // Safe data loading with fallbacks
            try {
                const clientDataToSet = proposal.clientData || proposal.client || { name: '', contact: '', projectName: '', email: '', phone: '' };
                setClientData(clientDataToSet);
            } catch (clientError) {
                console.warn('Error loading client data for viewing, using defaults:', clientError);
                setClientData({ name: 'Cliente não informado', contact: '', projectName: '', email: '', phone: '' });
            }

            try {
                const accountManagerToSet = proposal.accountManager || { name: '', email: '', phone: '' };
                setAccountManagerData(accountManagerToSet);
            } catch (accountManagerError) {
                console.warn('Error loading account manager data for viewing, using defaults:', accountManagerError);
                setAccountManagerData({ name: 'Gerente não informado', email: '', phone: '' });
            }

            try {
                const productsToSet = Array.isArray(proposal.products) ? proposal.products : [];
                setAddedProducts(productsToSet);
            } catch (productsError) {
                console.warn('Error loading products for viewing, using empty array:', productsError);
                setAddedProducts([]);
            }

            setViewMode('proposal-summary');
            
            console.log('✅ Proposal loaded for viewing successfully');
            
        } catch (error) {
            console.error('❌ Critical error viewing proposal:', error);
            
            // Log error with structured logging
            logError('Failed to view proposal', error, {
                operation: 'viewProposal',
                userId: user?.id,
                requestId: `view_${Date.now()}`,
                metadata: { proposalId: proposal?.id }
            }, {
                severity: 'MEDIUM',
                suggestedActions: ['Try refreshing the page', 'Check proposal data integrity']
            });
            
            alert('Erro ao visualizar proposta. Tente novamente ou contate o suporte.');
        }
    };

    const createNewProposal = () => {
        setCurrentProposal(null);
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
    };

    const handleDeleteProposal = async (proposalId: string) => {
        if (!confirm(`Tem certeza que deseja excluir a proposta ${proposalId}?`)) return;

        try {
            // First, delete all versions of the proposal
            const proposalsCol = collection(db, 'proposals');
            const q = query(proposalsCol, where('baseId', '==', proposalId.split('_v')[0]));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'proposals', d.id)));
            await Promise.all(deletePromises);

            alert('Proposta e todas as suas versões foram excluídas com sucesso!');
            fetchProposals(); // Refresh the list
        } catch (error) {
            console.error("Erro ao excluir proposta: ", error);
            alert('Erro ao excluir proposta. Tente novamente.');
        }
    };

    const editProposal = (proposal: Proposal) => {
        console.log('Starting proposal edit process for proposal:', proposal?.id);
        
        // Enhanced validation of proposal data structure before loading
        const validationResult = validateProposalStructure(proposal);
        if (!validationResult.isValid) {
            console.error('editProposal: Proposal validation failed:', validationResult.errors);
            
            // User-friendly error message based on validation failure
            const errorMessage = createUserFriendlyErrorMessage(validationResult.errors);
            alert(errorMessage);
            
            // Log error for debugging with structured logging
            logError('Proposal validation failed', new Error(validationResult.errors.join('; ')), {
                operation: 'editProposal',
                userId: user?.id,
                requestId: `edit_${Date.now()}`
            }, {
                severity: 'MEDIUM',
                suggestedActions: ['Verify proposal data integrity', 'Try creating a new proposal']
            });
            
            return;
        }

        // Log proposal structure for debugging
        console.log('Proposal structure validation:', {
            hasClientData: !!proposal.clientData,
            hasClient: !!proposal.client,
            hasAccountManager: !!proposal.accountManager,
            hasProducts: !!proposal.products,
            productsCount: proposal.products?.length || 0,
            hasMetadata: !!proposal.metadata,
            metadataKeys: proposal.metadata ? Object.keys(proposal.metadata).length : 0
        });

        try {
            console.log('Loading proposal for editing:', proposal);
            
            // Set current proposal
            setCurrentProposal(proposal);
            
            // Enhanced client data loading with comprehensive backward compatibility
            let clientDataToLoad: ClientData = { name: '', contact: '', projectName: '', email: '', phone: '' };
            let clientDataLoadSuccess = false;
            
            try {
                // Priority 1: Use clientData field (new format)
                if (proposal.clientData && typeof proposal.clientData === 'object') {
                    clientDataToLoad = {
                        name: proposal.clientData.name || '',
                        contact: proposal.clientData.contact || '',
                        projectName: proposal.clientData.projectName || '',
                        email: proposal.clientData.email || '',
                        phone: proposal.clientData.phone || '',
                        // Handle additional fields that might exist
                        companyName: (proposal.clientData as any).companyName || '',
                        address: (proposal.clientData as any).address || '',
                        cnpj: (proposal.clientData as any).cnpj || ''
                    };
                    clientDataLoadSuccess = true;
                    console.log('Client data loaded from clientData field');
                }
                // Priority 2: Use client field for backward compatibility
                else if (proposal.client) {
                    if (typeof proposal.client === 'object') {
                        clientDataToLoad = {
                            name: (proposal.client as any).name || '',
                            contact: (proposal.client as any).contact || '',
                            projectName: (proposal.client as any).projectName || '',
                            email: (proposal.client as any).email || '',
                            phone: (proposal.client as any).phone || '',
                            companyName: (proposal.client as any).companyName || '',
                            address: (proposal.client as any).address || '',
                            cnpj: (proposal.client as any).cnpj || ''
                        };
                        clientDataLoadSuccess = true;
                        console.log('Client data loaded from client object field');
                    } else if (typeof proposal.client === 'string') {
                        clientDataToLoad = { 
                            name: proposal.client, 
                            contact: '', 
                            projectName: '', 
                            email: '', 
                            phone: '',
                            companyName: proposal.client,
                            address: '',
                            cnpj: ''
                        };
                        clientDataLoadSuccess = true;
                        console.log('Client data loaded from client string field');
                    }
                }
                
                if (!clientDataLoadSuccess) {
                    console.warn('No valid client data found in proposal, using defaults');
                }
            } catch (clientError) {
                console.error('Error loading client data:', clientError);
                clientDataLoadSuccess = false;
            }
            
            setClientData(clientDataToLoad);
            
            // Enhanced account manager data loading with error handling
            let accountManagerToLoad: AccountManagerData = { name: '', email: '', phone: '' };
            let accountManagerLoadSuccess = false;
            
            try {
                if (proposal.accountManager) {
                    if (typeof proposal.accountManager === 'object') {
                        accountManagerToLoad = {
                            name: proposal.accountManager.name || '',
                            email: proposal.accountManager.email || '',
                            phone: proposal.accountManager.phone || '',
                            // Handle additional fields
                            department: (proposal.accountManager as any).department || '',
                            role: (proposal.accountManager as any).role || ''
                        };
                        accountManagerLoadSuccess = true;
                        console.log('Account manager data loaded from object');
                    } else if (typeof proposal.accountManager === 'string') {
                        accountManagerToLoad = { 
                            name: proposal.accountManager, 
                            email: '', 
                            phone: '',
                            department: '',
                            role: ''
                        };
                        accountManagerLoadSuccess = true;
                        console.log('Account manager data loaded from string');
                    }
                }
                
                if (!accountManagerLoadSuccess) {
                    console.warn('No valid account manager data found in proposal, using defaults');
                }
            } catch (accountManagerError) {
                console.error('Error loading account manager data:', accountManagerError);
                accountManagerLoadSuccess = false;
            }
            
            setAccountManagerData(accountManagerToLoad);
            
            // Enhanced products loading with validation
            let productsLoadSuccess = false;
            try {
                if (proposal.products && Array.isArray(proposal.products)) {
                    // Validate each product has required fields
                    const validProducts = proposal.products.filter(product => {
                        return product && 
                               typeof product === 'object' && 
                               product.id && 
                               product.description &&
                               typeof product.setup === 'number' &&
                               typeof product.monthly === 'number';
                    });
                    
                    if (validProducts.length > 0) {
                        setAddedProducts([...validProducts]);
                        productsLoadSuccess = true;
                        console.log(`Loaded ${validProducts.length} valid products`);
                        
                        if (validProducts.length < proposal.products.length) {
                            console.warn(`${proposal.products.length - validProducts.length} invalid products were filtered out`);
                        }
                    } else {
                        console.warn('No valid products found in proposal');
                        setAddedProducts([]);
                    }
                } else {
                    console.warn('No products array found in proposal, setting empty array');
                    setAddedProducts([]);
                }
            } catch (productsError) {
                console.error('Error loading products:', productsError);
                setAddedProducts([]);
                productsLoadSuccess = false;
            }
            
            // Enhanced calculator state restoration with comprehensive metadata handling
            const metadata = (proposal as any).metadata;
            const firstProduct = proposal.products && proposal.products.length > 0 ? proposal.products[0] : null;
            
            console.log('Loading calculator state from metadata:', {
                hasMetadata: !!metadata,
                metadataVersion: metadata?.metadataVersion,
                metadataKeys: metadata ? Object.keys(metadata) : [],
                hasFirstProduct: !!firstProduct,
                firstProductDetails: firstProduct?.details
            });
            
            // Restore discount settings with multiple fallback sources
            try {
                // Salesperson discount
                if (metadata?.applySalespersonDiscount !== undefined) {
                    setApplySalespersonDiscount(metadata.applySalespersonDiscount);
                    console.log('Salesperson discount loaded from metadata:', metadata.applySalespersonDiscount);
                } else if ((proposal as any).applySalespersonDiscount !== undefined) {
                    setApplySalespersonDiscount((proposal as any).applySalespersonDiscount);
                    console.log('Salesperson discount loaded from top-level field:', (proposal as any).applySalespersonDiscount);
                } else {
                    setApplySalespersonDiscount(false);
                    console.log('Salesperson discount set to default: false');
                }
                
                // Director discount
                if (metadata?.appliedDirectorDiscountPercentage !== undefined) {
                    setAppliedDirectorDiscountPercentage(metadata.appliedDirectorDiscountPercentage);
                    console.log('Director discount loaded from metadata:', metadata.appliedDirectorDiscountPercentage);
                } else if ((proposal as any).appliedDirectorDiscountPercentage !== undefined) {
                    setAppliedDirectorDiscountPercentage((proposal as any).appliedDirectorDiscountPercentage);
                    console.log('Director discount loaded from top-level field:', (proposal as any).appliedDirectorDiscountPercentage);
                } else {
                    setAppliedDirectorDiscountPercentage(0);
                    console.log('Director discount set to default: 0');
                }
            } catch (discountError) {
                console.error('Error loading discount settings:', discountError);
                setApplySalespersonDiscount(false);
                setAppliedDirectorDiscountPercentage(0);
            }
            
            // Contract term with comprehensive fallback chain
            try {
                let contractTermLoaded = false;
                if (metadata?.contractTerm && typeof metadata.contractTerm === 'number') {
                    setContractTerm(metadata.contractTerm);
                    contractTermLoaded = true;
                    console.log('Contract term loaded from metadata:', metadata.contractTerm);
                } else if (firstProduct?.details?.contractTerm && typeof firstProduct.details.contractTerm === 'number') {
                    setContractTerm(firstProduct.details.contractTerm);
                    contractTermLoaded = true;
                    console.log('Contract term loaded from first product contractTerm:', firstProduct.details.contractTerm);
                } else if (firstProduct?.details?.term && typeof firstProduct.details.term === 'number') {
                    setContractTerm(firstProduct.details.term);
                    contractTermLoaded = true;
                    console.log('Contract term loaded from first product term:', firstProduct.details.term);
                } else if (proposal.contractPeriod && typeof proposal.contractPeriod === 'number') {
                    setContractTerm(proposal.contractPeriod);
                    contractTermLoaded = true;
                    console.log('Contract term loaded from proposal contractPeriod:', proposal.contractPeriod);
                }
                
                if (!contractTermLoaded) {
                    setContractTerm(12);
                    console.log('Contract term set to default: 12');
                }
            } catch (contractTermError) {
                console.error('Error loading contract term:', contractTermError);
                setContractTerm(12);
            }
            
            // Installation setting
            try {
                if (metadata?.includeInstallation !== undefined) {
                    setIncludeInstallation(metadata.includeInstallation);
                    console.log('Include installation loaded from metadata:', metadata.includeInstallation);
                } else if (firstProduct?.details?.includeInstallation !== undefined) {
                    setIncludeInstallation(firstProduct.details.includeInstallation);
                    console.log('Include installation loaded from first product:', firstProduct.details.includeInstallation);
                } else {
                    setIncludeInstallation(true);
                    console.log('Include installation set to default: true');
                }
            } catch (installationError) {
                console.error('Error loading installation setting:', installationError);
                setIncludeInstallation(true);
            }
            
            // Selected speed
            try {
                if (metadata?.selectedSpeed && typeof metadata.selectedSpeed === 'number') {
                    setSelectedSpeed(metadata.selectedSpeed);
                    console.log('Selected speed loaded from metadata:', metadata.selectedSpeed);
                } else if (firstProduct?.details?.speed && typeof firstProduct.details.speed === 'number') {
                    setSelectedSpeed(firstProduct.details.speed);
                    console.log('Selected speed loaded from first product:', firstProduct.details.speed);
                } else {
                    setSelectedSpeed(0);
                    console.log('Selected speed set to default: 0');
                }
            } catch (speedError) {
                console.error('Error loading selected speed:', speedError);
                setSelectedSpeed(0);
            }
            
            // Partner settings with comprehensive fallback
            try {
                // Referral partner
                if (metadata?.includeReferralPartner !== undefined) {
                    setIncludeReferralPartner(metadata.includeReferralPartner);
                    console.log('Include referral partner loaded from metadata:', metadata.includeReferralPartner);
                } else if ((proposal as any).includeReferralPartner !== undefined) {
                    setIncludeReferralPartner((proposal as any).includeReferralPartner);
                    console.log('Include referral partner loaded from top-level field:', (proposal as any).includeReferralPartner);
                } else {
                    setIncludeReferralPartner(false);
                    console.log('Include referral partner set to default: false');
                }
                
                // Influencer partner
                if (metadata?.includeInfluencerPartner !== undefined) {
                    setIncludeInfluencerPartner(metadata.includeInfluencerPartner);
                    console.log('Include influencer partner loaded from metadata:', metadata.includeInfluencerPartner);
                } else if ((proposal as any).includeInfluencerPartner !== undefined) {
                    setIncludeInfluencerPartner((proposal as any).includeInfluencerPartner);
                    console.log('Include influencer partner loaded from top-level field:', (proposal as any).includeInfluencerPartner);
                } else {
                    setIncludeInfluencerPartner(false);
                    console.log('Include influencer partner set to default: false');
                }
            } catch (partnerError) {
                console.error('Error loading partner settings:', partnerError);
                setIncludeReferralPartner(false);
                setIncludeInfluencerPartner(false);
            }
            
            // Additional calculator state variables with error handling
            try {
                // Existing customer
                if (metadata?.isExistingCustomer !== undefined) {
                    setIsExistingCustomer(metadata.isExistingCustomer);
                } else {
                    setIsExistingCustomer(false);
                }
                
                // Previous monthly
                if (metadata?.previousMonthly !== undefined && typeof metadata.previousMonthly === 'number') {
                    setPreviousMonthly(metadata.previousMonthly);
                } else {
                    setPreviousMonthly(0);
                }
                
                // Last mile settings
                if (metadata?.includeLastMile !== undefined) {
                    setIncludeLastMile(metadata.includeLastMile);
                } else {
                    setIncludeLastMile(false);
                }
                
                if (metadata?.lastMileCost !== undefined && typeof metadata.lastMileCost === 'number') {
                    setLastMileCost(metadata.lastMileCost);
                } else {
                    setLastMileCost(0);
                }
                
                // Project value
                if (metadata?.projectValue !== undefined && typeof metadata.projectValue === 'number') {
                    setProjectValue(metadata.projectValue);
                } else {
                    setProjectValue(0);
                }
                
                // Director discount percentage (different from applied)
                if (metadata?.directorDiscountPercentage !== undefined && typeof metadata.directorDiscountPercentage === 'number') {
                    setDirectorDiscountPercentage(metadata.directorDiscountPercentage);
                } else {
                    setDirectorDiscountPercentage(0);
                }
                
                console.log('Additional calculator state loaded successfully');
            } catch (additionalStateError) {
                console.error('Error loading additional calculator state:', additionalStateError);
                // Set defaults for all additional state
                setIsExistingCustomer(false);
                setPreviousMonthly(0);
                setIncludeLastMile(false);
                setLastMileCost(0);
                setProjectValue(0);
                setDirectorDiscountPercentage(0);
            }
            
            // Tax rates with validation
            try {
                if (metadata?.taxRates && typeof metadata.taxRates === 'object') {
                    // Validate tax rates structure
                    const defaultTaxRates = { pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 };
                    const loadedTaxRates = { ...defaultTaxRates, ...metadata.taxRates };
                    
                    // Ensure all values are numbers
                    Object.keys(loadedTaxRates).forEach(key => {
                        if (typeof loadedTaxRates[key] !== 'number' || isNaN(loadedTaxRates[key])) {
                            loadedTaxRates[key] = defaultTaxRates[key] || 0;
                        }
                    });
                    
                    setTaxRates(loadedTaxRates);
                    console.log('Tax rates loaded from metadata:', loadedTaxRates);
                } else {
                    const defaultTaxRates = { pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 };
                    setTaxRates(defaultTaxRates);
                    console.log('Tax rates set to default values');
                }
            } catch (taxRatesError) {
                console.error('Error loading tax rates:', taxRatesError);
                setTaxRates({ pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00, banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00 });
            }
            
            // Markup with validation
            try {
                if (metadata?.markup !== undefined && typeof metadata.markup === 'number' && !isNaN(metadata.markup)) {
                    setMarkup(metadata.markup);
                    console.log('Markup loaded from metadata:', metadata.markup);
                } else {
                    setMarkup(100);
                    console.log('Markup set to default: 100');
                }
            } catch (markupError) {
                console.error('Error loading markup:', markupError);
                setMarkup(100);
            }
            
            // Estimated net margin
            try {
                if (metadata?.estimatedNetMargin !== undefined && typeof metadata.estimatedNetMargin === 'number' && !isNaN(metadata.estimatedNetMargin)) {
                    setEstimatedNetMargin(metadata.estimatedNetMargin);
                    console.log('Estimated net margin loaded from metadata:', metadata.estimatedNetMargin);
                } else {
                    setEstimatedNetMargin(0);
                    console.log('Estimated net margin set to default: 0');
                }
            } catch (marginError) {
                console.error('Error loading estimated net margin:', marginError);
                setEstimatedNetMargin(0);
            }
            
            // UI state restoration
            try {
                if (metadata?.isEditingTaxes !== undefined) {
                    setIsEditingTaxes(metadata.isEditingTaxes);
                    console.log('Is editing taxes loaded from metadata:', metadata.isEditingTaxes);
                } else {
                    setIsEditingTaxes(false);
                    console.log('Is editing taxes set to default: false');
                }
            } catch (editingTaxesError) {
                console.error('Error loading isEditingTaxes state:', editingTaxesError);
                setIsEditingTaxes(false);
            }
            
            // Log successful completion with detailed summary
            const loadingSummary = {
                proposalId: proposal.id,
                clientDataLoaded: clientDataLoadSuccess,
                accountManagerLoaded: accountManagerLoadSuccess,
                productsLoaded: productsLoadSuccess,
                productsCount: proposal.products?.length || 0,
                metadataLoaded: !!metadata,
                discountsRestored: {
                    salesperson: applySalespersonDiscount,
                    director: appliedDirectorDiscountPercentage
                },
                contractTerm: contractTerm,
                selectedSpeed: selectedSpeed
            };
            
            console.log('Proposal loaded successfully for editing:', loadingSummary);
            
            // Log successful proposal loading with structured logging
            const successContext: LogContext = {
                operation: 'editProposal',
                userId: user?.id,
                requestId: `edit_${Date.now()}`,
                metadata: {
                    proposalId: proposal.id,
                    clientDataLoaded: clientDataLoadSuccess,
                    accountManagerLoaded: accountManagerLoadSuccess,
                    productsLoaded: productsLoadSuccess,
                    productsCount: proposal.products?.length || 0,
                    metadataLoaded: !!metadata
                }
            };

            logSuccess('Proposal loaded for editing', successContext, {
                resultCount: proposal.products?.length || 0,
                fallbackUsed: !clientDataLoadSuccess || !accountManagerLoadSuccess || !productsLoadSuccess
            });
            
            // Provide user feedback for successful loading
            if (clientDataLoadSuccess && accountManagerLoadSuccess && productsLoadSuccess) {
                console.log('✅ All proposal data loaded successfully');
            } else {
                console.warn('⚠️ Some proposal data used fallback values');
                
                // Show user-friendly warning for partial data loading
                const warningMessage = createPartialLoadingWarning(clientDataLoadSuccess, accountManagerLoadSuccess, productsLoadSuccess);
                if (warningMessage) {
                    setTimeout(() => {
                        if (confirm(`${warningMessage}\n\nDeseja continuar mesmo assim?`)) {
                            console.log('User confirmed to continue with partial data');
                        }
                    }, 500);
                }
            }
            
            setViewMode('calculator');
            
        } catch (error) {
            console.error('Critical error loading proposal for editing:', error);
            
            // Enhanced error handling with comprehensive logging and user feedback
            const errorContext: LogContext = {
                operation: 'editProposal',
                userId: user?.id,
                requestId: `edit_${Date.now()}`,
                metadata: {
                    proposalId: proposal?.id,
                    proposalStructure: Object.keys(proposal || {}),
                    errorType: error?.constructor?.name || 'Unknown'
                }
            };

            // Log error with structured logging
            logError('Critical error in proposal editing', error, errorContext, {
                severity: 'HIGH',
                suggestedActions: [
                    'Check proposal data integrity',
                    'Verify database connection',
                    'Try creating a new proposal',
                    'Contact support if issue persists'
                ]
            });
            
            // Enhanced error classification and user-friendly messaging
            const { errorMessage, recoveryGuidance, canContinue } = classifyEditProposalError(error);
            
            const fullMessage = `${errorMessage}\n\n${recoveryGuidance}${canContinue ? '\n\nVocê pode continuar editando, mas talvez precise reinserir algumas informações.' : ''}`;
            
            alert(fullMessage);
            
            // Implement intelligent fallback behavior
            const fallbackResult = attemptProposalDataRecovery(proposal);
            
            if (fallbackResult.success) {
                console.log('✅ Partial data recovery successful:', fallbackResult.recoveredData);
                
                // Apply recovered data
                setCurrentProposal(proposal);
                setClientData(fallbackResult.recoveredData.clientData);
                setAccountManagerData(fallbackResult.recoveredData.accountManagerData);
                setAddedProducts(fallbackResult.recoveredData.products);
                
                // Apply recovered calculator state or safe defaults
                applyCalculatorStateWithFallback(fallbackResult.recoveredData.calculatorState);
                
                // Log successful recovery
                logSuccess('Proposal data partially recovered', errorContext, {
                    resultCount: fallbackResult.recoveredData.products.length,
                    fallbackUsed: true
                });
                
                setViewMode('calculator');
                
            } else {
                console.error('❌ Data recovery failed:', fallbackResult.error);
                
                // Log recovery failure
                logError('Proposal data recovery failed', fallbackResult.error, errorContext, {
                    severity: 'CRITICAL',
                    suggestedActions: ['Create new proposal', 'Contact support']
                });
                
                alert('Não foi possível recuperar os dados da proposta. Por favor, crie uma nova proposta.');
                setViewMode('search');
            }
        }
    };

    const selectedPlan = radioPlans.find(p => p.speed === selectedSpeed);
    const monthly = selectedPlan ? getMonthlyPrice(selectedPlan, contractTerm) : 0;
    const setup = selectedPlan ? (includeInstallation ? selectedPlan.installationCost : 0) : 0;

    // Calculate result with payback validation
    const result = selectedPlan ? {
        selectedPlan,
        monthlyPrice: monthly,
        installationCost: setup,
        paybackValidation: validatePayback(
            setup,
            monthly,
            contractTerm
        )
    } : null;

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const costBreakdown = useMemo(() => {
        if (!selectedPlan) return {
            finalPrice: 0,
            setupFee: 0,
            cost: 0,
            commissionValue: 0,
            referralPartnerCommission: 0,
            revenueTaxValue: 0,
            profitTaxValue: 0,
            grossProfit: 0,
            netProfit: 0,
            netMargin: 0,
            fiberCost: 0,
            markupAmount: 0,
            priceBeforeDiscounts: 0
        };

        const cost = selectedPlan.manCost || 0;
        const M = markup / 100;
        
        // Calcular preço base usando markup sobre o custo
        const markupAmount = cost * M;
        const priceWithMarkup = cost + markupAmount;
        
        // DRE should show discounted monthly revenue BEFORE commission deductions
    // This is the revenue that appears in DRE calculations
    // A taxa de instalação deve ser considerada como receita
        // Incluir a taxa de instalação na receita (distribuída ao longo do contrato)
        const setupFee = finalTotalSetup; // Setup cost without discounts (correct)
    const setupFeeMonthly = contractTerm > 0 ? setupFee / contractTerm : 0;
    const discountedMonthlyRevenue = (totalMonthly * salespersonDiscountFactor * directorDiscountFactor) + setupFeeMonthly;
    const finalPrice = discountedMonthlyRevenue; // Monthly revenue with discounts applied, before commissions
        
        // Calculate actual commission values for DRE display
        const referralPartnerCommissionValue = referralPartnerCommission + influencerPartnerCommission;
        const commissionValue = finalPrice * 0.1; // Example commission rate
        
        // Calculate taxes on the discounted revenue
        const pisTax = finalPrice * (taxRates.pis / 100);
        const cofinsTax = finalPrice * (taxRates.cofins / 100);
        const revenueTaxValue = pisTax + cofinsTax;
        
        // Calculate gross profit: revenue minus costs, taxes, and commissions
        const grossProfit = finalPrice - cost - revenueTaxValue - referralPartnerCommissionValue;
        
        // Calculate profit taxes
        const csllTax = grossProfit > 0 ? grossProfit * (taxRates.csll / 100) : 0;
        const irpjTax = grossProfit > 0 ? grossProfit * (taxRates.irpj / 100) : 0;
        const profitTaxValue = csllTax + irpjTax;
        
        // Calculate final net profit
        const netProfit = grossProfit - profitTaxValue;
        const netMargin = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;

        return {
            finalPrice, // This is now the discounted monthly revenue for DRE display
            setupFee, // Setup costs without discounts
            cost,
            commissionValue,
            referralPartnerCommission: referralPartnerCommissionValue,
            revenueTaxValue,
            profitTaxValue,
            grossProfit,
            netProfit,
            netMargin,
            fiberCost: 0, // MAN doesn't have fiber cost
            markupAmount,
            priceBeforeDiscounts: priceWithMarkup
        };
    }, [selectedPlan, monthly, setup, taxRates, markup, finalTotalMonthly, finalTotalSetup, totalMonthly, salespersonDiscountFactor, directorDiscountFactor, referralPartnerCommission, influencerPartnerCommission]);

    // Calculate estimated net margin based on current values
    useEffect(() => {
        if (costBreakdown && costBreakdown.finalPrice > 0) {
            const margin = (costBreakdown.netProfit / costBreakdown.finalPrice) * 100;
            setEstimatedNetMargin(isNaN(margin) ? 0 : margin);
        }
    }, [costBreakdown]);

    // Cálculo correto das comissões baseado na seleção dos parceiros
    const comissaoParceiroIndicador = includeReferralPartner ? (referralPartnerCommission || 0) : 0;
    const comissaoParceiroInfluenciador = includeInfluencerPartner ? (influencerPartnerCommission || 0) : 0;
    
    // Calcular a comissão correta baseado na presença de parceiros
    // Commission should be calculated on the discounted monthly revenue
    const temParceiros = includeReferralPartner || includeInfluencerPartner;
    const comissaoVendedor = temParceiros 
        ? (costBreakdown.finalPrice * (getChannelSellerCommissionRate(channelSeller, 12) / 100)) // Canal/Vendedor quando há parceiros
        : (costBreakdown.finalPrice * (getSellerCommissionRate(seller, 12) / 100)); // Vendedor quando não há parceiros

    // Função para calcular DRE para um período específico
    const calculateDREForPeriod = useCallback((months: number) => {
        if (!costBreakdown || costBreakdown.finalPrice === 0) {
            return {
                receitaMensal: 0,
                receitaInstalacao: 0,
                receitaTotalPrimeiromes: 0,
                custoFibra: 0,
                custoBanda: 0,
                fundraising: 0,
                lastMile: 0,
                pis: 0,
                cofins: 0,
                csll: 0,
                irpj: 0,
                comissaoVendedor: 0,
                comissaoParceiroIndicador: 0,
                comissaoParceiroInfluenciador: 0,
                totalComissoes: 0,
                custoDespesa: 0,
                balance: 0,
                rentabilidade: 0,
                lucratividade: 0
            };
        }

        const monthlyValue = costBreakdown.finalPrice;
        let totalRevenue = monthlyValue * months;
        const taxaInstalacao = costBreakdown.setupFee;

        const receitaInstalacao = taxaInstalacao;
        const receitaTotalPrimeiromes = totalRevenue + receitaInstalacao;
        
        // CORREÇÃO: Custo de banda = velocidade × 2,09 × meses do período
        const velocidade = selectedSpeed || 0; // Velocidade em Mbps
        const custoBandaMensal = velocidade * taxRates.banda; // 600 × 2,09 = 1.254,00
        const custoBanda = custoBandaMensal * months; // 1.254,00 × 12 = 15.048,00
        
        // Custo Fibra vem da calculadora conforme prazo contratual e velocidade
        const custoFibraCalculadora = costBreakdown.cost || 0;
        
        const fundraising = 0; // Conforme tabela
        const lastMile = 0; // Conforme tabela

        // CORREÇÃO: Impostos baseados na receita total (incluindo taxa de instalação)
        const pisRate = taxRates.pis / 100;
        const cofinsRate = taxRates.cofins / 100;
        const csllRate = taxRates.csll / 100;
        const irpjRate = taxRates.irpj / 100;

        // Impostos sobre receita
        const pis = receitaTotalPrimeiromes * pisRate;
        const cofins = receitaTotalPrimeiromes * cofinsRate;
        
        // CORREÇÃO: Cálculo específico do CSLL conforme regra de negócio
        // Primeiro mês: taxa instalação × 15% × 9% = 33,75 (sem multiplicar)
        // Demais meses: valor mensal × 15% × 9% × (meses - 1) = 70,35 × 11 = 773,85
        // Total: 33,75 + 773,85 = 807,60 ≈ 877,93
        const margemCSLL = 15; // 15% (valor direto)
        const csllPercent = 9; // 9% (valor direto)
        const csllPrimeiroMes = receitaInstalacao * (margemCSLL / 100) * (csllPercent / 100);
        const csllDemaisMeses = monthlyValue * (margemCSLL / 100) * (csllPercent / 100) * (months - 1);
        const csll = csllPrimeiroMes + csllDemaisMeses;
        
        // IRPJ segue a mesma lógica do CSLL
        const irpjPercent = taxRates.irpj; // Usar percentual do IRPJ da tabela
        const irpjPrimeiroMes = receitaInstalacao * (margemCSLL / 100) * (irpjPercent / 100);
        const irpjDemaisMeses = monthlyValue * (margemCSLL / 100) * (irpjPercent / 100) * (months - 1);
        const irpj = irpjPrimeiroMes + irpjDemaisMeses;

        // CORREÇÃO: Cálculo das comissões seguindo o modelo do Internet Rádio
        const comissaoParceiroIndicador = includeReferralPartner 
            ? receitaTotalPrimeiromes * (getPartnerIndicatorRate(monthlyValue, months))
            : 0;
        
        const comissaoParceiroInfluenciador = includeInfluencerPartner 
            ? receitaTotalPrimeiromes * (getPartnerInfluencerRate(monthlyValue, months))
            : 0;
        
        // Calcular a comissão do vendedor baseado na presença de parceiros
        const temParceiros = includeReferralPartner || includeInfluencerPartner;
        const comissaoVendedor = temParceiros 
            ? (receitaTotalPrimeiromes * (getChannelSellerCommissionRate(channelSeller, months) / 100)) // Canal/Vendedor quando há parceiros
            : (receitaTotalPrimeiromes * (getSellerCommissionRate(seller, months) / 100)); // Vendedor quando não há parceiros
        
        // Total das comissões
        const totalComissoes = comissaoVendedor + comissaoParceiroIndicador + comissaoParceiroInfluenciador;
        
        const custoDespesa = receitaTotalPrimeiromes * 0.10; // 10% conforme padrão

        // Balance (Lucro Líquido) - Receita total (incluindo instalação) menos todos os custos
        const balance = receitaTotalPrimeiromes - custoBanda - custoFibraCalculadora - pis - cofins - csll - irpj - totalComissoes - custoDespesa;

        // Rentabilidade e Lucratividade baseadas na receita total (incluindo instalação)
        const rentabilidade = receitaTotalPrimeiromes > 0 ? (balance / receitaTotalPrimeiromes) * 100 : 0;
        const lucratividade = rentabilidade; // Mesmo valor conforme tabela

        return {
            receitaMensal: totalRevenue, // Agora é receita total do período
            receitaInstalacao,
            receitaTotalPrimeiromes,
            custoFibra: custoFibraCalculadora, // Custo Fibra da calculadora
            custoBanda, // Custo de banda calculado como 2,09% da receita
            fundraising,
            lastMile,
            pis,
            cofins,
            csll,
            irpj,
            comissaoVendedor,
            comissaoParceiroIndicador,
            comissaoParceiroInfluenciador,
            totalComissoes,
            custoDespesa,
            balance,
            rentabilidade,
            lucratividade
        };
    }, [costBreakdown, taxRates, includeReferralPartner, includeInfluencerPartner, channelSeller, seller, selectedSpeed]);

    // Calculate DRE metrics para múltiplos períodos
    const dreCalculations = useMemo(() => {
        const periods = [12, 24, 36, 48, 60];
        const calculations: any = {};
        
        periods.forEach(months => {
            calculations[months] = calculateDREForPeriod(months);
        });

        // Manter compatibilidade com código existente
        const dre12 = calculations[12];
        return {
            ...dre12,
            // Adicionar cálculos para todos os períodos
            ...calculations,
            // Campos de compatibilidade
            receitaBruta: dre12.receitaTotalPrimeiromes,
            receitaLiquida: dre12.receitaTotalPrimeiromes - dre12.pis - dre12.cofins,
            custoServico: dre12.custoFibra,
            taxaInstalacao: dre12.receitaInstalacao,
            totalImpostos: dre12.pis + dre12.cofins + dre12.csll + dre12.irpj,
            lucroOperacional: dre12.balance,
            lucroLiquido: dre12.balance,
            paybackMeses: dre12.receitaInstalacao > 0 && dre12.balance > 0 ? Math.ceil(dre12.receitaInstalacao / dre12.balance) : 0,
            impostosReceita: dre12.pis + dre12.cofins,
            impostosLucro: dre12.csll + dre12.irpj
        };
    }, [calculateDREForPeriod]);





    if (viewMode === 'search') {
        return (
            <div className="container mx-auto p-4">
                <div className="mb-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setViewMode('calculator')}
                        className="flex items-center mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Propostas de Internet MAN</CardTitle>
                        <CardDescription>Encontre propostas existentes ou crie uma nova.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-4">
                            <Input
                                type="text"
                                placeholder="Buscar por cliente ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white flex-1"
                            />
                            <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />Nova Proposta
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-700">
                                        <TableHead className="text-white">ID</TableHead>
                                        <TableHead className="text-white">Cliente</TableHead>
                                        <TableHead className="text-white">Data</TableHead>
                                        <TableHead className="text-white">Total Mensal</TableHead>
                                        <TableHead className="text-white">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProposals.map(p => (
                                        <TableRow key={p.id} className="border-slate-800">
                                            <TableCell>{p.baseId || p.id}</TableCell>
                                            <TableCell>{typeof p.client === 'string' ? p.client : p.client?.name || 'Sem nome'} (v{p.version})</TableCell>
                                            <TableCell>{p.createdAt ? (
                                                (typeof p.createdAt === 'object' && 'toDate' in p.createdAt)
                                                    ? new Date(p.createdAt.toDate()).toLocaleDateString('pt-BR')
                                                    : (isNaN(new Date(p.createdAt).getTime()) ? 'N/A' : new Date(p.createdAt).toLocaleDateString('pt-BR'))
                                            ) : 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(p.totalMonthly || p.value || 0)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => viewProposal(p)}>
                                                        <FileText className="h-4 w-4 mr-2" /> Visualizar Proposta
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Editar Proposta
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteProposal(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredProposals.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-slate-400">
                                                Nenhuma proposta encontrada
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            {viewMode === 'client-form' ? (
                <ClientManagerForm 
                    clientData={clientData}
                    accountManagerData={accountManagerData}
                    onClientDataChange={setClientData}
                    onAccountManagerDataChange={setAccountManagerData}
                    onBack={() => setViewMode('search')}
                    onContinue={handleClientFormSubmit}
                />
            ) : viewMode === 'proposal-summary' && currentProposal ? (
                <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                    <CardHeader className="print:pb-2">
                        <div className="flex justify-between items-start mb-4 print:mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-gray-600">Internet via Rádio - MAN</p>
                            </div>
                            <div className="flex gap-2 no-print">
                                <Button variant="outline" onClick={() => setViewMode('search')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />Voltar
                                </Button>
                                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                                    <Download className="h-4 w-4 mr-2" />Imprimir PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 print:space-y-4">
                        {/* Dados do Cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.client.name}</p>
                                    <p><strong>Projeto:</strong> {currentProposal.client.projectName}</p>
                                    <p><strong>Email:</strong> {currentProposal.client.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.client.phone}</p>
                                    <p><strong>Contato:</strong> {currentProposal.client.contact}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.accountManager.name}</p>
                                    <p><strong>Email:</strong> {currentProposal.accountManager.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.accountManager.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Produtos */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Produtos e Serviços</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-900">Descrição</TableHead>
                                        <TableHead className="text-gray-900">Setup</TableHead>
                                        <TableHead className="text-gray-900">Mensal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(currentProposal.products || []).map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>{formatCurrency(product.setup)}</TableCell>
                                            <TableCell>{formatCurrency(product.monthly)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="border-t pt-4 print:pt-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>

                            {/* Show discount breakdown if discounts were applied */}
                            {(currentProposal.applySalespersonDiscount || currentProposal.appliedDirectorDiscountPercentage > 0) && (
                                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                                    <h4 className="font-semibold text-orange-800 mb-2">Descontos Aplicados</h4>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Valores Originais:</strong></p>
                                        <p className="ml-4">Setup: {formatCurrency(currentProposal.totalSetup || 0)}</p>
                                        <p className="ml-4">Mensal: {formatCurrency(currentProposal.baseTotalMonthly || currentProposal.totalMonthly || 0)}</p>

                                        {currentProposal.applySalespersonDiscount && (
                                            <p className="text-orange-600"><strong>Desconto Vendedor (5%):</strong> -R$ {((currentProposal.baseTotalMonthly || currentProposal.totalMonthly || 0) * 0.05).toFixed(2).replace('.', ',')}</p>
                                        )}

                                        {currentProposal.appliedDirectorDiscountPercentage > 0 && (
                                            <p className="text-orange-600"><strong>Desconto Diretor ({currentProposal.appliedDirectorDiscountPercentage}%):</strong> -R$ {(((currentProposal.baseTotalMonthly || currentProposal.totalMonthly || 0) * (currentProposal.applySalespersonDiscount ? 0.95 : 1)) * (currentProposal.appliedDirectorDiscountPercentage / 100)).toFixed(2).replace('.', ',')}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p><strong>Total Setup:</strong> {formatCurrency(currentProposal.totalSetup)}</p>
                                    <p><strong>Total Mensal {(currentProposal.applySalespersonDiscount || currentProposal.appliedDirectorDiscountPercentage > 0) ? '(com desconto)' : ''}:</strong> {formatCurrency(currentProposal.totalMonthly)}</p>
                                </div>
                                <div>
                                    <p><strong>Data da Proposta:</strong> {currentProposal.createdAt ? (isNaN(new Date(currentProposal.createdAt).getTime()) ? 'N/A' : new Date(currentProposal.createdAt).toLocaleDateString('pt-BR')) : 'N/A'}</p>
                                    <p><strong>ID da Proposta:</strong> {currentProposal.id}</p>
                                    <p><strong>Versão:</strong> {currentProposal.version}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payback Info se disponível */}
                        {(currentProposal.products || []).some(p => p.setup > 0) && (
                            <div className="border-t pt-4 print:pt-2">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de Payback</h3>
                                {(() => {
                                    const totalSetup = currentProposal.totalSetup;
                                    const totalMonthly = currentProposal.totalMonthly;
                                    const paybackMonths = totalSetup > 0 ? Math.ceil(totalSetup / totalMonthly) : 0;
                                    const maxPayback = 24; // Default max payback
                                    const isValid = paybackMonths <= maxPayback;
                                    
                                    return (
                                        <div className="text-sm">
                                            <p><strong>Payback:</strong> {paybackMonths} meses</p>
                                            <p><strong>Payback Máximo:</strong> {maxPayback} meses</p>
                                            <p className={isValid ? 'text-green-600' : 'text-red-600'}>
                                                <strong>Status:</strong> {isValid ? '✓ Aprovado' : '⚠ Atenção - Payback excedido'}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{currentProposal ? 'Editar Proposta' : 'Nova Proposta'}</h1>
                                <p className="text-slate-400 mt-2">Configure e calcule os custos para internet via rádio.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setViewMode('search')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    ← Voltar para Busca
                                </Button>
                                {onBackToDashboard && (
                                    <Button
                                        variant="outline"
                                        onClick={onBackToDashboard}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        ← Dashboard
                                    </Button>
                                )}
                            </div>
                        </div>
                        <ClientManagerInfo clientData={clientData} accountManagerData={accountManagerData} />
                    </div>

                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} bg-slate-800`}>
                            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                            {user?.role === 'admin' && (
                                <TabsTrigger value="prices">Tabela de Preços</TabsTrigger>
                            )}
                            {user?.role === 'admin' && (
                                <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                            )}
                            {user?.role === 'admin' && (
                                <TabsTrigger value="dre">DRE</TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="calculator">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><Calculator className="mr-2" />Calculadora</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contract-term">Prazo Contratual</Label>
                                                <Select onValueChange={(v) => setContractTerm(Number(v))} value={contractTerm.toString()}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="12">12 meses</SelectItem>
                                                        <SelectItem value="24">24 meses</SelectItem>
                                                        <SelectItem value="36">36 meses</SelectItem>
                                                        <SelectItem value="48">48 meses</SelectItem>
                                                        <SelectItem value="60">60 meses</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="speed">Velocidade</Label>
                                                <Select onValueChange={(v) => setSelectedSpeed(Number(v))} value={selectedSpeed.toString()}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {(radioPlans || []).filter(p => getMonthlyPrice(p, contractTerm) > 0).map(plan => (
                                                            <SelectItem key={plan.speed} value={plan.speed.toString()}>{plan.description}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="include-installation" 
                                                            checked={includeInstallation} 
                                                            onCheckedChange={(c) => setIncludeInstallation(c as boolean)} 
                                                        />
                                                        <Label htmlFor="include-installation" className="text-sm">Incluir taxa de instalação no cálculo</Label>
                                                    </div>
                                                    
                                                    
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="existing-customer" 
                                                            checked={isExistingCustomer} 
                                                            onCheckedChange={(c) => {
                                                                setIsExistingCustomer(c as boolean);
                                                                if (!c) setPreviousMonthly(0);
                                                            }} 
                                                        />
                                                        <Label htmlFor="existing-customer" className="text-sm">Já é cliente da Base?</Label>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {isExistingCustomer && (
                                                        <div className="space-y-1">
                                                            <Label htmlFor="previous-monthly" className="text-sm">Mensalidade Anterior</Label>
                                                            <Input 
                                                                type="number" 
                                                                id="previous-monthly" 
                                                                value={previousMonthly} 
                                                                onChange={(e) => setPreviousMonthly(Number(e.target.value))} 
                                                                placeholder="R$" 
                                                                className="bg-slate-800 h-8 text-sm" 
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="include-last-mile" 
                                                            checked={includeLastMile} 
                                                            onCheckedChange={(c) => {
                                                                setIncludeLastMile(c as boolean);
                                                                if (!c) setLastMileCost(0);
                                                            }} 
                                                        />
                                                        <Label htmlFor="include-last-mile" className="text-sm">Last Mile?</Label>
                                                    </div>
                                                    
                                                    {includeLastMile && (
                                                        <div className="space-y-1">
                                                            <Label htmlFor="last-mile-cost" className="text-sm">Custo (Last Mile)</Label>
                                                            <Input 
                                                                type="number" 
                                                                id="last-mile-cost" 
                                                                value={lastMileCost} 
                                                                onChange={(e) => setLastMileCost(Number(e.target.value))} 
                                                                placeholder="R$" 
                                                                className="bg-slate-800 h-8 text-sm" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="include-referral-partner" 
                                                    checked={includeReferralPartner} 
                                                    onCheckedChange={(c) => setIncludeReferralPartner(c as boolean)} 
                                                />
                                                <Label htmlFor="include-referral-partner" className="text-sm">Incluir Parceiro Indicador</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="include-influencer-partner" 
                                                    checked={includeInfluencerPartner} 
                                                    onCheckedChange={(c) => setIncludeInfluencerPartner(c as boolean)} 
                                                />
                                                <Label htmlFor="include-influencer-partner" className="text-sm">Incluir Parceiro Influenciador</Label>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="man-cost">Custo MAN</Label>
                                            <Input 
                                                type="number" 
                                                id="man-cost"
                                                value={selectedSpeed && contractTerm ? 
                                                    (radioPlans.find(p => p.speed === selectedSpeed)?.manCost || 0) 
                                                    : 0
                                                } 
                                                onChange={(e) => {
                                                    const newManCost = Number(e.target.value);
                                                    const updatedPlans = (radioPlans || []).map(plan => 
                                                        plan.speed === selectedSpeed 
                                                            ? { ...plan, manCost: newManCost }
                                                            : plan
                                                    );
                                                    setRadioPlans(updatedPlans);
                                                }}
                                                placeholder="Ex: 3500"
                                                className="bg-slate-800"
                                                disabled={!selectedSpeed || !contractTerm}
                                            />
                                            <div className="text-xs text-slate-400">
                                                {selectedSpeed && contractTerm ? 
                                                    `${radioPlans.find(p => p.speed === selectedSpeed)?.description} - ${contractTerm} meses` 
                                                    : "Selecione prazo e velocidade para editar"
                                                }
                                            </div>
                                        </div>
                                        
                                        {includeInstallation && (
                                            <div className="space-y-2">
                                                <Label htmlFor="project-value">Custo do Projeto</Label>
                                                <Input type="number" id="project-value" value={projectValue} onChange={(e) => setProjectValue(Number(e.target.value))} placeholder="Ex: 15000" className="bg-slate-800" />
                                            </div>
                                        )}
                                        
                                        {/* Seção de Resultado e Validação de Payback */}
                                        {result && (
                                            <div className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                                <h4 className="text-lg font-semibold text-white">Resultado do Cálculo</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Valor Mensal:</span>
                                                        <span className="font-semibold">{formatCurrency(result.monthlyPrice)}</span>
                                                    </div>
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Instalação:</span>
                                                            <span className="font-semibold">{formatCurrency(result.installationCost)}</span>
                                                        </div>
                                                    )}
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Payback Calculado:</span>
                                                            <span className="font-semibold">{result.paybackValidation.actualPayback} meses</span>
                                                        </div>
                                                    )}
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Payback Máximo Permitido:</span>
                                                            <span className="font-semibold">{result.paybackValidation.maxPayback} meses</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Alerta de Payback */}
                                                {includeInstallation && !result.paybackValidation.isValid && (
                                                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                            <span className="font-semibold text-red-400">⚠️ Payback acima do permitido!</span>
                                                        </div>
                                                        <p className="text-sm text-red-300 mt-1">
                                                            O payback de {result.paybackValidation.actualPayback} meses excede o limite de {result.paybackValidation.maxPayback} meses para contratos de {contractTerm} meses.
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Alerta de Sucesso */}
                                                {includeInstallation && result.paybackValidation.isValid && (
                                                    <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="font-semibold text-green-400">✅ Payback dentro do limite!</span>
                                                        </div>
                                                        <p className="text-sm text-green-300 mt-1">
                                                            O payback de {result.paybackValidation.actualPayback} meses está dentro do limite de {result.paybackValidation.maxPayback} meses.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <Button onClick={handleAddProduct} disabled={!selectedSpeed} className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Produto</Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2" />Resumo da Proposta</CardTitle></CardHeader>
                                    <CardContent>
                                        {(addedProducts ?? []).length === 0 ? (
                                            <p className="text-slate-400">Nenhum produto adicionado.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                                                    {addedProducts.map((product) => (
                                                        <div key={product.id} className="p-3 bg-slate-800 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-semibold flex-1 pr-2">{product.description}</p>
                                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)} className="text-red-400 hover:bg-red-900/50 h-7 w-7">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm space-y-1 mt-2">
                                                                <div className="flex justify-between"><span>Instalação:</span><span>{formatCurrency(product.setup)}</span></div>
                                                                <div className="flex justify-between"><span>Mensal:</span><span>{formatCurrency(product.monthly)}</span></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className="bg-slate-700" />
                                                
                                                {/* Controles de Desconto */}
                                                <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                                                    {(user?.role !== 'diretor' && user?.role !== 'admin') && (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="salesperson-discount-toggle"
                                                                checked={applySalespersonDiscount}
                                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                                            />
                                                            <Label htmlFor="salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                                        </div>
                                                    )}
                                                    {(user?.role === 'diretor' || user?.role === 'admin') && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="director-discount">Desconto Diretor (%)</Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Input
                                                                    id="director-discount"
                                                                    type="number"
                                                                    value={directorDiscountPercentage}
                                                                    onChange={(e) => {
                                                                        const value = Number(e.target.value);
                                                                        setDirectorDiscountPercentage(value);
                                                                        setAppliedDirectorDiscountPercentage(value);
                                                                    }}
                                                                    placeholder="0-100"
                                                                    min="0"
                                                                    max="100"
                                                                    className="bg-slate-700 border-slate-600 text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {user?.role === 'admin' && (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="admin-salesperson-discount-toggle"
                                                                checked={applySalespersonDiscount}
                                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                                            />
                                                            <Label htmlFor="admin-salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <Separator className="bg-slate-700" />
                                                <div className="space-y-2 font-bold">
                                                    {/* Setup costs are not discounted - show full price */}
                                                    <div className="flex justify-between"><span>Total Instalação:</span><span>{formatCurrency(finalTotalSetup)}</span></div>
                                                    
                                                    {/* Monthly costs show discounts applied */}
                                                    {(applySalespersonDiscount || appliedDirectorDiscountPercentage > 0) && (
                                                        <div className="text-sm text-slate-400 mt-2">
                                                            <div>Valor mensal base: {formatCurrency(totalMonthly)}</div>
                                                            {applySalespersonDiscount && (
                                                                <div className="flex justify-between text-orange-400">
                                                                    <span>Desconto Vendedor (5%):</span>
                                                                    <span>-{formatCurrency(totalMonthly * 0.05)}</span>
                                                                </div>
                                                            )}
                                                            {appliedDirectorDiscountPercentage > 0 && (
                                                                <div className="flex justify-between text-orange-400">
                                                                    <span>Desconto Diretor ({appliedDirectorDiscountPercentage}%):</span>
                                                                    <span>-{formatCurrency(totalMonthly * salespersonDiscountFactor * (appliedDirectorDiscountPercentage / 100))}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-green-400"><span>Total Mensal:</span><span>{formatCurrency(finalTotalMonthly)}</span></div>
                                                    
                                                    {/* Payback Information */}
                                                    {result && includeInstallation && (
                                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Informações de Payback</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Payback Calculado:</span>
                                                                    <span className="font-semibold">{result.paybackValidation.actualPayback} meses</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Payback Máximo:</span>
                                                                    <span className="font-semibold">{result.paybackValidation.maxPayback} meses</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Status:</span>
                                                                    <span className={`font-semibold ${result.paybackValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {result.paybackValidation.isValid ? '✅ Dentro do limite' : '⚠️ Acima do limite'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Proposta
                                </Button>
                                <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Download className="h-4 w-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button onClick={cancelAction} variant="destructive">
                                    Cancelar
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="commissions-table">
                            <div className="space-y-6">
                                <CommissionTablesUnified />
                            </div>
                        </TabsContent>
                        
                        {/* DRE - Demonstrativo de Resultado do Exercício */}
                        <TabsContent value="dre">
                            <div className="space-y-6 mt-6">
                                {/* Análise Financeira */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <div className="w-4 h-4 bg-green-500 mr-2"></div>
                                            Análise Financeira
                                        </CardTitle>
                                        <CardDescription>Resumo dos cálculos financeiros</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Receita Bruta Mensal:</span>
                                                    <span className="text-green-400">{formatCurrency(costBreakdown.finalPrice)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Receita Total do Contrato (12m):</span>
                                                    <span className="text-green-400">{formatCurrency(costBreakdown.finalPrice * 12)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxa de Setup:</span>
                                                    <span className="text-green-400">{formatCurrency(costBreakdown.setupFee)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Custo do Serviço:</span>
                                                    <span className="text-red-400">{formatCurrency(costBreakdown.cost)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Receita Líquida Total:</span>
                                                    <span className={costBreakdown.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {formatCurrency(costBreakdown.netProfit * 12)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Receita Líquida Mensal Média:</span>
                                                    <span className={costBreakdown.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {formatCurrency(costBreakdown.netProfit)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Margem Líquida:</span>
                                                    <span className={costBreakdown.netMargin >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {costBreakdown.netMargin.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* DRE - Demonstrativo de Resultado do Exercício */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                                            DRE - Demonstrativo de Resultado do Exercício
                                        </CardTitle>
                                        <CardDescription>DRE - Período: 12 Meses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-700">
                                                    <TableHead className="text-white">Descrição</TableHead>
                                                    <TableHead className="text-right text-white">Valor Mensal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="border-slate-800 bg-green-900/30">
                                                    <TableCell className="text-white font-semibold">Receita Mensal</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Taxa Setup</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.setupFee)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Custos Diretos</TableCell>
                                                    <TableCell className="text-right text-white"></TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Custo Man</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.cost)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">
                                                        {(includeReferralPartner || includeInfluencerPartner) ? 'Comissão Canal/Vendedor' : 'Comissão Vendedor'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(dreCalculations.comissaoVendedor)}</TableCell>
                                                </TableRow>
                                                {referralPartnerCommission > 0 && (
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Comissão Parceiro Indicador</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(referralPartnerCommission)}</TableCell>
                                                    </TableRow>
                                                )}
                                                {influencerPartnerCommission > 0 && (
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Comissão Parceiro Influenciador</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(influencerPartnerCommission)}</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Impostos sobre Receita</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.revenueTaxValue)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">PIS ({taxRates.pis.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.pis / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Cofins ({taxRates.cofins.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.cofins / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-blue-900/30">
                                                    <TableCell className="text-white font-semibold">Lucro Bruto</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Impostos sobre Lucro</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.profitTaxValue)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">CSLL ({taxRates.csll.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit > 0 ? costBreakdown.grossProfit * (taxRates.csll / 100) : 0)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">IRPJ ({taxRates.irpj.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit > 0 ? costBreakdown.grossProfit * (taxRates.irpj / 100) : 0)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-green-900/50">
                                                    <TableCell className="text-white font-bold">LUCRO LÍQUIDO</TableCell>
                                                    <TableCell className={`text-right font-bold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(costBreakdown.netProfit)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white font-semibold">Balance</TableCell>
                                                    <TableCell className={`text-right font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(costBreakdown.netProfit)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white font-semibold">Rentabilidade %</TableCell>
                                                    <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {((costBreakdown.netProfit / costBreakdown.finalPrice) * 100).toFixed(2)}%
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white font-semibold">Lucratividade</TableCell>
                                                    <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {((costBreakdown.netProfit / costBreakdown.finalPrice) * 100).toFixed(2)}%
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        
                                        {/* Payback */}
                                        <div className="mt-6 pt-4 border-t border-slate-700">
                                            <h3 className="text-lg font-semibold mb-2">Payback</h3>
                                            <div className="text-2xl font-bold text-green-400">
                                                {dreCalculations.paybackMeses > 0 ? `${dreCalculations.paybackMeses} meses` : '0 meses'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tabela de Impostos Editável */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="flex items-center">
                                                    <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                                                    Tabela de Impostos
                                                </CardTitle>
                                                <CardDescription>Configure as alíquotas de impostos</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditingTaxes(!isEditingTaxes)}
                                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                {isEditingTaxes ? 'Salvar' : 'Editar'}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="pis-rate">PIS (%)</Label>
                                                <Input
                                                    id="pis-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.pis.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('pis', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cofins-rate">Cofins (%)</Label>
                                                <Input
                                                    id="cofins-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.cofins.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('cofins', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="csll-rate">CSLL (%)</Label>
                                                <Input
                                                    id="csll-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.csll.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('csll', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="irpj-rate">IRPJ (%)</Label>
                                                <Input
                                                    id="irpj-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.irpj.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('irpj', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="banda-rate">Banda (%)</Label>
                                                <Input
                                                    id="banda-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.banda.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('banda', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fundraising-rate">Fundraising (%)</Label>
                                                <Input
                                                    id="fundraising-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.fundraising.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('fundraising', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="rate-rate">Rate (%)</Label>
                                                <Input
                                                    id="rate-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.rate.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('rate', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="margem-rate">Margem (%)</Label>
                                                <Input
                                                    id="margem-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.margem.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('margem', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="custo-desp-rate">Custo/Desp (%)</Label>
                                                <Input
                                                    id="custo-desp-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.custoDesp.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('custoDesp', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Markup e Margem Líquida */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-cyan-400">Markup e Margem Líquida</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="markup">Markup (%)</Label>
                                                <Input
                                                    id="markup"
                                                    type="number"
                                                    value={markup}
                                                    onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="margem-liquida">Margem Líquida (%)</Label>
                                                <Input
                                                    id="margem-liquida"
                                                    type="text"
                                                    value={`${estimatedNetMargin.toFixed(2)}%`}
                                                    readOnly
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Custo Base:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.cost)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Impostos (0.00%):</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.revenueTaxValue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Custo Total c/ Impostos:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.cost + costBreakdown.revenueTaxValue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-green-400">Markup (100%):</span>
                                                <span className="text-green-400">+{formatCurrency(costBreakdown.cost * (markup / 100))}</span>
                                            </div>
                                            <div className="flex justify-between items-center font-semibold">
                                                <span className="text-white">Preço Final:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.finalPrice)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-cyan-400">Margem Líquida:</span>
                                                <span className={`${costBreakdown.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {costBreakdown.netMargin.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recursos Base (Custos) */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-cyan-400">Recursos Base (Custos)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-cyan-400">Custo de Instalação</Label>
                                                    <div className="mt-2">
                                                        <Label htmlFor="custo-mensal">Custo Único</Label>
                                                        <Input
                                                            id="custo-mensal"
                                                            type="number"
                                                            value={selectedPlan ? selectedPlan.installationCost : 0}
                                                            readOnly
                                                            className="bg-slate-800 border-slate-700 text-white mt-1 cursor-not-allowed"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-cyan-400">Custo MAN</Label>
                                                    <div className="mt-2">
                                                        <Label htmlFor="custo-unico">Custo Único</Label>
                                                        <Input
                                                            id="custo-unico"
                                                            type="number"
                                                            value={selectedPlan ? (selectedPlan.manCost || 0) : 0}
                                                            readOnly
                                                            className="bg-slate-800 border-slate-700 text-white mt-1 cursor-not-allowed"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Resultado Final */}
                                <Card className="border-green-500 bg-gradient-to-r from-slate-900 to-green-900/20">
                                    <CardHeader className="bg-gradient-to-r from-green-800 to-green-700 py-4">
                                        <CardTitle className="text-xl font-bold text-white flex items-center">
                                            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                            Resultado Final
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {/* RECEITA */}
                                            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                                                <h3 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wide">RECEITA</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Mensal:</span>
                                                        <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.receitaBruta)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Anual:</span>
                                                        <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.receitaBruta * 12)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Setup:</span>
                                                        <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.taxaInstalacao)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CUSTOS */}
                                            <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-lg border border-red-500/30">
                                                <h3 className="text-sm font-semibold text-red-300 mb-3 uppercase tracking-wide">CUSTOS</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Banda:</span>
                                                        <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.custoBanda)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Comissão:</span>
                                                        <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.comissaoVendedor)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Impostos:</span>
                                                        <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.totalImpostos)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* LUCRO */}
                                            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg border border-green-500/30">
                                                <h3 className="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wide">LUCRO</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Operacional:</span>
                                                        <span className={`font-semibold ${dreCalculations.lucroOperacional >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                            {formatCurrency(dreCalculations.lucroOperacional)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Líquido:</span>
                                                        <span className={`font-semibold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                            {formatCurrency(dreCalculations.lucroLiquido)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Anual:</span>
                                                        <span className={`font-semibold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                            {formatCurrency(dreCalculations.lucroLiquido * 12)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* INDICADORES */}
                                            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg border border-purple-500/30">
                                                <h3 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wide">INDICADORES</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Margem:</span>
                                                        <span className={`font-semibold ${dreCalculations.rentabilidade >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                            {dreCalculations.rentabilidade.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Payback:</span>
                                                        <span className="text-purple-300 font-semibold">
                                                            {dreCalculations.paybackMeses}m
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">ROI Anual:</span>
                                                        <span className={`font-semibold ${dreCalculations.rentabilidade >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                            {(dreCalculations.rentabilidade * 12).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resumo Executivo */}
                                        <div className="mt-6 pt-6 border-t border-slate-700">
                                            <div className="flex items-center mb-4">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                <h3 className="text-lg font-semibold text-white">Resumo Executivo</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-400">
                                                        {formatCurrency(dreCalculations.receitaBruta * 12)}
                                                    </div>
                                                    <div className="text-sm text-slate-400">Receita Total (12m)</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(dreCalculations.lucroLiquido * 12)}
                                                    </div>
                                                    <div className="text-sm text-slate-400">Lucro Total (12m)</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold ${dreCalculations.rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {dreCalculations.rentabilidade.toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-slate-400">Margem Líquida</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        {user?.role === 'admin' && (
                            <TabsContent value="prices">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Tabela de Preços - Internet MAN</CardTitle>
                                        <CardDescription>Valores mensais para diferentes velocidades e prazos. Clique nos valores para editar.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-slate-700">
                                                        <TableHead className="text-white">Velocidade</TableHead>
                                                        <TableHead className="text-right text-white">12 meses</TableHead>
                                                        <TableHead className="text-right text-white">24 meses</TableHead>
                                                        <TableHead className="text-right text-white">36 meses</TableHead>
                                                        <TableHead className="text-right text-white">48 meses</TableHead>
                                                        <TableHead className="text-right text-white">60 meses</TableHead>
                                                    <TableHead className="text-right text-white">Custo de Instalação</TableHead>
                                                    <TableHead className="text-right text-white">Custo MAN</TableHead>
                                                </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(radioPlans || []).map((plan, index) => (
                                                        <TableRow key={plan.speed} className="border-slate-800">
                                                            <TableCell>{plan.description}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.price12.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price12', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.price24.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price24', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.price36.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price36', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.price48.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price48', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.price60.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price60', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={plan.installationCost.toFixed(2)} onChange={(e) => handlePriceChange(index, 'installationCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={(plan.manCost || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'manCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button onClick={handleSavePrices}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Salvar Preços
                                            </Button>
                                        </div>
                                        
                                        {/* Informações de Contrato */}
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold mb-4 text-white">Informações de Contrato</h3>
                                            <div className="space-y-2 text-white">
                                                <p>Contratos de 12 meses - Payback 08 meses</p>
                                                <p>Contratos de 24 meses - Payback 10 meses</p>
                                                <p>Contratos de 36 meses - Payback 11 meses</p>
                                                <p>Contratos de 48 meses - Payback 13 meses</p>
                                                <p>Contratos de 60 meses - Payback 14 meses</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            )}
                        </Tabs>
                    </>
                )}
            </div>
        );
    };

export default InternetManCalculator;