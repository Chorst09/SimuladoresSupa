"use client";

import React, { useState, useEffect, useMemo } from 'react';
// Firebase removido - usando apenas Supabase
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@/styles/print.css';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommissionTablesUnified from './CommissionTablesUnified';
import { useCommissions, getChannelIndicatorCommissionRate, getChannelInfluencerCommissionRate, getChannelSellerCommissionRate, getSellerCommissionRate } from '@/hooks/use-commissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calculator,
    Phone,
    PhoneForwarded,
    Settings,
    FileText,
    Download,
    Save,
    Search,
    Edit,
    Plus,
    User,
    Briefcase,
    Trash2,
    Server,
    Brain,
    Cpu,
    MemoryStick,
    HardDrive,
    Network,
    PlusCircle,
    FilePenLine,
    ArrowLeft
} from 'lucide-react';

// Import shared components
import { ClientManagerForm } from '@/components/calculators/ClientManagerForm';

// Local interfaces
interface ClientData {
    name: string;
    contact?: string;
    projectName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
}

interface AccountManagerData {
    name: string;
    email?: string;
    phone?: string;
    distributorId?: string;
}
import { ClientManagerInfo } from '@/components/calculators/ClientManagerInfo';

// Brazilian currency formatter
const formatBrazilianNumber = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
};

// Interfaces
interface PABXTier {
    min: number;
    max: number;
    setup: number;
    monthly: number;
}

interface SIPPlan {
    name: string;
    type: 'PLANO' | 'TARIFADO';
    setup: number;
    monthly: number;
    monthlyWithEquipment?: number; // Opcional para planos que não têm essa opção
    channels: number;
}

interface PABXResult {
    setup: number;
    baseMonthly: number;
    deviceRentalCost: number;
    aiAgentCost: number;
    totalMonthly: number;
}

interface SIPResult {
    setup: number;
    monthly: number;
    additionalChannelsCost: number;
}

// Interface para um produto adicionado à proposta
type ProductType = 'VM' | 'PABX' | 'SIP';

interface Product {
    id: string;
    type: ProductType;
    description: string;
    setup: number;
    monthly: number;
    details: any;
}

interface Proposal {
    id: string; // ID do documento no Firestore
    baseId: string;
    version: number;
    userId: string; // ID do usuário que criou a proposta
    client: ClientData | string; // Pode ser objeto ou string
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    contractPeriod: number; // Período do contrato em meses
    createdAt: string | any; // Pode ser string ou objeto Firestore
    status: string;
    // Campos opcionais para compatibilidade
    clientData?: ClientData;
    items?: Product[];
    applySalespersonDiscount?: boolean;
    appliedDirectorDiscountPercentage?: number;
    expiryDate?: string;
}

import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';


interface MaquinasVirtuaisCalculatorProps {
    onBackToDashboard?: () => void;
}

const MaquinasVirtuaisCalculator = ({ onBackToDashboard }: MaquinasVirtuaisCalculatorProps) => {
    // Initialize auth hook
    const auth = useAuth();
    const currentUser = auth?.user;
    console.log("User role:", currentUser?.role);

    // Estados de gerenciamento de propostas
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [showClientForm, setShowClientForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    const filteredProposals = proposals.filter((p) => {
        const clientName = typeof p.client === 'string' ? p.client : p.client?.name || '';
        return clientName.toLowerCase().includes(searchTerm.toLowerCase());
    })

    // Estados dos dados do cliente e gerente
    const [clientData, setClientData] = useState<ClientData>({
        name: '',
        contact: '',
        projectName: '',
        email: '',
        phone: ''
    });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
        name: '',
        email: '',
        phone: ''
    });
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('Aguardando Aprovação do Cliente');

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(0);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(false);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(0);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);

    // Estados Agente IA
    const [includeAIAgent, setIncludeAIAgent] = useState(false);
    const [selectedAIAgentPlan, setSelectedAIAgentPlan] = useState('');

    // Estados para DRE
    const [isEditingTaxes, setIsEditingTaxes] = useState<boolean>(false);
    const [taxRates, setTaxRates] = useState({
        banda: 2.09,
        fundraising: 0,
        rate: 24,
        pis: 15.00,
        cofins: 0.00,
        margem: 0.00,
        csll: 0.00,
        irpj: 0.00,
        custoDesp: 10
    });

    // Estados para descontos
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0);

    // Estados SIP
    const [selectedSipPlan, setSelectedSipPlan] = useState<string>('');
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(false);
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    const fetchProposals = React.useCallback(async () => {
        console.log('fetchProposals chamado, currentUser:', currentUser);
        if (!currentUser || !currentUser.role) {
            console.log('Usuário não encontrado ou sem role');
            setProposals([]);
            return;
        }

        try {
            const response = await fetch('/api/proposals', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`,
                },
            });

            if (response.ok) {
                const proposalsData = await response.json();
                console.log('Todas as propostas:', proposalsData);
                // Filter for VM proposals
                const vmProposals = proposalsData.filter((p: any) =>
                    p.type === 'VM' || p.baseId?.startsWith('Prop_MV_')
                );
                console.log('Propostas VM filtradas:', vmProposals);
                setProposals(vmProposals);
            } else {
                console.error('Erro ao buscar propostas:', response.statusText);
                setProposals([]);
            }
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
            setProposals([]);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.id) {
            fetchProposals();
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (!currentUser?.id) return;

        const loadSettings = async () => {
            try {
                // Try to load from localStorage first
                const savedSettings = localStorage.getItem(`vmPricingSettings_${currentUser.id}`);
                if (savedSettings) {
                    const settingsData = JSON.parse(savedSettings);
                    setMarkup(settingsData.markup || 30);
                    setCommissionPercentage(settingsData.commissionPercentage || 3);
                    setSetupFee(settingsData.setupFee || 500);
                    setManagementAndSupportCost(settingsData.managementAndSupportCost || 250);
                    setVcpuWindowsCost(settingsData.vcpuWindowsCost || 15);
                    setVcpuLinuxCost(settingsData.vcpuLinuxCost || 10);
                    setRamCost(settingsData.ramCost || 8);
                    setHddSasCost(settingsData.hddSasCost || 0.5);
                    setSsdPerformanceCost(settingsData.ssdPerformanceCost || 1.5);
                    setNvmeCost(settingsData.nvmeCost || 2.5);
                    setNetwork1GbpsCost(settingsData.network1GbpsCost || 0);
                    setNetwork10GbpsCost(settingsData.network10GbpsCost || 100);
                    setWindowsServerCost(settingsData.windowsServerCost || 135);
                    setWindows10ProCost(settingsData.windows10ProCost || 120);
                    setWindows11ProCost(settingsData.windows11ProCost || 130);
                    setUbuntuCost(settingsData.ubuntuCost || 0);
                    setCentosCost(settingsData.centosCost || 0);
                    setDebianCost(settingsData.debianCost || 0);
                    setRockyLinuxCost(settingsData.rockyLinuxCost || 0);
                    setBackupCostPerGb(settingsData.backupCostPerGb || 1.25);
                    setAdditionalIpCost(settingsData.additionalIpCost || 15);
                    setSnapshotCost(settingsData.snapshotCost || 25);
                    setVpnSiteToSiteCost(settingsData.vpnSiteToSiteCost || 50);
                    setPisCofins(String(settingsData.pisCofins || '15,00').replace('.', ','));
                    setIss(String(settingsData.iss || '0,00').replace('.', ','));
                    setCsllIr(String(settingsData.csllIr || '0,00').replace('.', ','));
                    setVmQuantity(settingsData.vmQuantity || 1);
                    if (settingsData.contractDiscounts) {
                        setContractDiscounts(settingsData.contractDiscounts);
                    }
                    return;
                }

                // Try to fetch from API as fallback
                const response = await fetch(`/api/vm-settings?userId=${currentUser.id}`);
                if (response.ok) {
                    const settingsData = await response.json();
                    setMarkup(settingsData.markup || 30);
                    setCommissionPercentage(settingsData.commissionPercentage || 3);
                    setSetupFee(settingsData.setupFee || 500);
                    setManagementAndSupportCost(settingsData.managementAndSupportCost || 250);
                    // ... outros settings
                }
            } catch (error) {
                console.error("Erro ao buscar configurações de preço:", error);
            }
        };

        loadSettings();
    }, [currentUser?.id]);

    // Load tax rates from localStorage (only once)
    useEffect(() => {
        try {
            const savedTaxRates = localStorage.getItem('vmTaxRates');
            if (savedTaxRates) {
                const parsedRates = JSON.parse(savedTaxRates);
                if (parsedRates.pis && parsedRates.cofins && parsedRates.csll && parsedRates.irpj) {
                    setTaxRates(prevRates => ({ ...prevRates, ...parsedRates }));
                }
            }
        } catch (error) {
            console.error('Error loading tax rates from localStorage:', error);
        }
    }, []);

    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('simples_nacional');
    const [pisCofins, setPisCofins] = useState<string>('15,00');
    const [iss, setIss] = useState<string>('0,00');
    const [csllIr, setCsllIr] = useState<string>('0,00');



    // Cálculo de impostos baseado nas taxas editáveis
    const revenueTaxes = useMemo(() => {
        // Apenas PIS + COFINS sobre receita
        const total = ((taxRates.pis || 15.00) + (taxRates.cofins || 0.00)) / 100;
        console.log('Revenue taxes calculation:', { pis: taxRates.pis || 15.00, cofins: taxRates.cofins || 0.00, total });
        return total;
    }, [taxRates.pis, taxRates.cofins]);

    const profitTaxes = useMemo(() => {
        // CSLL + IRPJ sobre lucro
        const total = (taxRates.csll + taxRates.irpj) / 100;
        console.log('Profit taxes calculation:', { csll: taxRates.csll, irpj: taxRates.irpj, total });
        return total;
    }, [taxRates.csll, taxRates.irpj]);

    // Estado para controle de abas
    const [activeTab, setActiveTab] = useState<string>('calculator');

    // Estados para configuração de VM
    const [vmName, setVmName] = useState<string>('Servidor Principal');
    const [vmCpuCores, setVmCpuCores] = useState<number>(2);
    const [vmRamGb, setVmRamGb] = useState<number>(4);
    const [vmStorageType, setVmStorageType] = useState<string>('HDD SAS');
    const [vmStorageSize, setVmStorageSize] = useState<number>(50);
    const [vmNetworkSpeed, setVmNetworkSpeed] = useState<string>('1 Gbps');
    const [vmOperatingSystem, setVmOperatingSystem] = useState<string>('Ubuntu Server 22.04 LTS');
    const [vmBackupSize, setVmBackupSize] = useState<number>(0);
    const [vmAdditionalIp, setVmAdditionalIp] = useState<boolean>(false);
    const [vmSnapshot, setVmSnapshot] = useState<boolean>(false);
    const [vmVpnSiteToSite, setVmVpnSiteToSite] = useState<boolean>(false);
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    const [includeInfluencerPartner, setIncludeInfluencerPartner] = useState<boolean>(false);
    const [vmContractPeriod, setVmContractPeriod] = useState<number>(12);
    const [vmQuantity, setVmQuantity] = useState<number>(1);

    // Hook para comissões editáveis
    const { channelIndicator, channelInfluencer, channelSeller, seller } = useCommissions();

    // Estados para configurações de preço
    const [markup, setMarkup] = useState<number>(30);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);
    const [setupFee, setSetupFee] = useState<number>(500);
    const [managementAndSupportCost, setManagementAndSupportCost] = useState<number>(250);
    const [contractDiscounts, setContractDiscounts] = useState<{ [key: number]: number }>({
        12: 0,
        24: 5,
        36: 10,
        48: 15,
        60: 20,
    });

    // Descontos
    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);

    // Cálculo do desconto contratual baseado no período
    const contractDiscount = useMemo(() => {
        return contractDiscounts[vmContractPeriod] || 0;
    }, [vmContractPeriod, contractDiscounts]);

    // Detectar mudanças nos valores para mostrar botão de nova versão
    useEffect(() => {
        if (currentProposal?.id) {
            setHasChanged(true);
        }
    }, [addedProducts, clientData, accountManagerData, selectedTaxRegime, taxRates, setupFee, vmContractPeriod, vmQuantity]);



    // Estados para custos de recursos VM
    const [vcpuWindowsCost, setVcpuWindowsCost] = useState<number>(15);
    const [vcpuLinuxCost, setVcpuLinuxCost] = useState<number>(10);
    const [ramCost, setRamCost] = useState<number>(8);
    const [hddSasCost, setHddSasCost] = useState<number>(0.5);
    const [ssdPerformanceCost, setSsdPerformanceCost] = useState<number>(1.5);
    const [nvmeCost, setNvmeCost] = useState<number>(2.5);
    const [network1GbpsCost, setNetwork1GbpsCost] = useState<number>(0);
    const [network10GbpsCost, setNetwork10GbpsCost] = useState<number>(100);
    const [windowsServerCost, setWindowsServerCost] = useState<number>(135);
    const [windows10ProCost, setWindows10ProCost] = useState<number>(120);
    const [windows11ProCost, setWindows11ProCost] = useState<number>(130);
    const [ubuntuCost, setUbuntuCost] = useState<number>(0);
    const [centosCost, setCentosCost] = useState<number>(0);
    const [debianCost, setDebianCost] = useState<number>(0);
    const [rockyLinuxCost, setRockyLinuxCost] = useState<number>(0);
    const [backupCostPerGb, setBackupCostPerGb] = useState<number>(1.25);
    const [additionalIpCost, setAdditionalIpCost] = useState<number>(15);
    const [snapshotCost, setSnapshotCost] = useState<number>(25);
    const [vpnSiteToSiteCost, setVpnSiteToSiteCost] = useState<number>(50);

    // Estados para controlar edição de cada card
    const [editingCards, setEditingCards] = useState<{ [key: string]: boolean }>({
        recursosBase: false,
        armazenamento: false,
        placaRede: false,
        sistemaOperacional: false,
        backup: false,
        ipAdicional: false,
        snapshot: false,
        vpnSiteToSite: false,
        prazosContratuais: false,
        taxaSetup: false,
        gestaoSuporte: false
    });

    // Função para alternar edição de um card específico
    const toggleCardEdit = (cardKey: string) => {
        setEditingCards(prev => ({
            ...prev,
            [cardKey]: !prev[cardKey]
        }));
    };

    // Função para salvar um card específico
    const saveCard = async (cardKey: string) => {
        try {
            await handleSaveSettings();
            setEditingCards(prev => ({
                ...prev,
                [cardKey]: false
            }));
        } catch (error) {
            console.error('Erro ao salvar card:', error);
        }
    };

    // Dados para as tabelas de List Price
    const pabxListPriceData = {
        headers: ['Serviço', 'Até 10 ramais', 'De 11 a 20 ramais', 'De 21 a 30 ramais', 'De 31 a 50 ramais', 'De 51 a 100 ramais', 'De 101 a 500 ramais', 'De 501 a 1.000 ramais'],
        rows: [
            { service: 'Setup (cobrança única)', values: ['1.250,00', '2.000,00', '2.500,00', '3.000,00', '3.500,00', 'Valor a combinar', 'Valor a combinar'] },
            { service: 'Valor por ramal (mensal unitário)', values: ['30,00', '29,00', '28,00', '27,00', '26,00', '25,00', '24,50'] },
            { service: 'Valor hospedagem (mensal)', values: ['200,00', '220,00', '250,00', '300,00', '400,00', 'Valor a combinar', 'Valor a combinar'] },
            { service: 'Aluguel Aparelho Grandstream (mensal)', values: ['35,00', '34,00', '33,00', '32,00', '30,00', 'Valor a combinar', 'Valor a combinar'] },
        ],
    };

    const sipListPriceData = {
        headers: {
            top: [
                { title: 'SIP TARIFADO', span: 2 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 }
            ],
            bottom: [
                'Call Center',
                '2 canais',
                '4 Canais',
                '10 Canais',
                '30 Canais',
                '60 Canais',
                '5 Canais',
                '10 Canais',
                '20 Canais',
                '30 Canais',
                '60 Canais'
            ]
        },
        rows: [
            {
                service: 'Canais Adicionais (Assinatura Mensal)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    ''
                ]
            },
            {
                service: 'Canais Adicionais (Franquia Mensal)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    '',
                    'Até 10 canais R$25 por canal adicional/mês',
                    'Até 20 canais R$ 25 por canal adicional/mês',
                    'Até 30 canais R$ 25 por canal adicional/mês',
                    '',
                    '',
                    '',
                    '',
                    'Sem possibilidade'
                ]
            },
            {
                service: 'Franquia/Assinatura Mensal (Sem Equipamentos)',
                values: [
                    'R$ 200 (Franquia)',
                    'R$ 150 (Franquia)',
                    'R$ 250 (Franquia)',
                    'R$ 350 (Franquia)',
                    'R$ 550 (Franquia)',
                    'R$ 1.000 (Franquia)',
                    'R$ 350 (Assinatura)',
                    'R$ 450 (Assinatura)',
                    'R$ 650 (Assinatura)',
                    'R$ 850 (Assinatura)',
                    'R$ 1.600 (Assinatura)'
                ]
            },
            {
                service: 'Franquia/Assinatura Mensal (Com Equipamentos)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    'R$ 500 (Franquia)',
                    'R$ 650 (Franquia)',
                    'R$ 1.200 (Franquia)',
                    '',
                    'R$ 500 (Assinatura)',
                    'R$ 600 (Assinatura)',
                    'R$ 800 (Assinatura)',
                    'R$ 950 (Assinatura)',
                    'R$ 1.700 (Assinatura)'
                ]
            },
            {
                service: 'Minutos Mensais Inclusos para Brasil Móvel',
                values: [
                    'Não Aplicável',
                    '',
                    'Não aplicável',
                    '',
                    '',
                    '',
                    '15.000 Minutos',
                    '20.000 Minutos',
                    '25.000 Minutos',
                    '30.000 Minutos',
                    '60.000 Minutos'
                ]
            },
            {
                service: 'Números Incluídos (Novos ou Portados)',
                values: [
                    'Consultar',
                    '',
                    'Máximo 3 Números',
                    '',
                    'Máximo 4 Números',
                    '',
                    'Máximo 5 Números',
                    'Máximo 10 Números',
                    'Máximo 15 Números',
                    'Máximo 20 Números',
                    'Máximo 30 Números'
                ]
            },
            {
                service: 'Numeração Adicional (Mensalidade)',
                values: [
                    'Consultar',
                    '',
                    'R$ 10 por Número',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'R$ 10 por Número',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa Local Fixo (por minuto)',
                values: [
                    'R$ 0,015 por minuto',
                    '',
                    'R$ 0,02 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'Ilimitado',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa DDD Fixo (por minuto)',
                values: [
                    'R$ 0,05 por minuto',
                    '',
                    'R$ 0,06 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'Ilimitado',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa Brasil Móvel (por minuto)',
                values: [
                    'R$ 0,09 por minuto',
                    '',
                    'R$ 0,10 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'R$ 10 por minuto',
                    '',
                    ''
                ]
            }
        ],
    };

    const aiAgentPlans: { [key: string]: { name: string; monthlyCost: number; messages: string; minutes: string; premiumVoice: string; credits: string; color: string } } = {
        plan20k: {
            name: '20K',
            monthlyCost: 720.00,
            credits: '20.000 Créditos de Interação',
            messages: '10.000 mensagens* ou',
            minutes: '2.000 minutos** ou',
            premiumVoice: '1.000 voz premium*** ou',
            color: 'bg-blue-900'
        },
        plan40k: {
            name: '40K',
            monthlyCost: 1370.00,
            credits: '40.000 Créditos de Interação',
            messages: '20.000 mensagens* ou',
            minutes: '4.000 minutos** ou',
            premiumVoice: '2.000 voz premium*** ou',
            color: 'bg-blue-800'
        },
        plan60k: {
            name: '60K',
            monthlyCost: 1940.00,
            credits: '60.000 Créditos de Interação',
            messages: '30.000 mensagens* ou',
            minutes: '6.000 minutos** ou',
            premiumVoice: '3.000 voz premium*** ou',
            color: 'bg-blue-600'
        },
        plan100k: {
            name: '100K',
            monthlyCost: 3060.00,
            credits: '100.000 Créditos de Interação',
            messages: '50.000 mensagens* ou',
            minutes: '10.000 minutos** ou',
            premiumVoice: '5.000 voz premium*** ou',
            color: 'bg-cyan-500'
        },
        plan150k: {
            name: '150K',
            monthlyCost: 4320.00,
            credits: '150.000 Créditos de Interação',
            messages: '75.000 mensagens* ou',
            minutes: '15.000 minutos** ou',
            premiumVoice: '7.500 voz premium*** ou',
            color: 'bg-teal-400'
        },
        plan200k: {
            name: '200K',
            monthlyCost: 5400.00,
            credits: '200.000 Créditos de Interação',
            messages: '100.000 mensagens* ou',
            minutes: '20.000 minutos** ou',
            premiumVoice: '10.000 voz premium*** ou',
            color: 'bg-teal-400'
        },
    };

    const pabxTiers: PABXTier[] = [
        { min: 1, max: 10, setup: 1250, monthly: 35 },
        { min: 11, max: 20, setup: 2000, monthly: 33 },
        { min: 21, max: 30, setup: 2500, monthly: 31 },
        { min: 31, max: 50, setup: 3000, monthly: 29 },
        { min: 51, max: 100, setup: 3500, monthly: 27 },
        { min: 101, max: 500, setup: 0, monthly: 25 }, // Valor a combinar
        { min: 501, max: 1000, setup: 0, monthly: 23 } // Valor a combinar
    ];

    const sipPlans: SIPPlan[] = [
        // Planos TARIFADO
        { name: 'SIP TARIFADO Call Center', type: 'TARIFADO', setup: 500, monthly: 200, channels: 0 },
        { name: 'SIP TARIFADO 2 Canais', type: 'TARIFADO', setup: 500, monthly: 150, channels: 2 },
        { name: 'SIP TARIFADO 4 Canais', type: 'TARIFADO', setup: 500, monthly: 250, monthlyWithEquipment: 500, channels: 4 },
        { name: 'SIP TARIFADO 10 Canais', type: 'TARIFADO', setup: 500, monthly: 350, monthlyWithEquipment: 500, channels: 10 },
        { name: 'SIP TARIFADO 30 Canais', type: 'TARIFADO', setup: 500, monthly: 550, monthlyWithEquipment: 650, channels: 30 },
        { name: 'SIP TARIFADO 60 Canais', type: 'TARIFADO', setup: 500, monthly: 1000, monthlyWithEquipment: 1200, channels: 60 },
        // Planos ILIMITADO
        { name: 'SIP ILIMITADO 5 Canais', type: 'PLANO', setup: 500, monthly: 350, monthlyWithEquipment: 500, channels: 5 },
        { name: 'SIP ILIMITADO 10 Canais', type: 'PLANO', setup: 500, monthly: 450, monthlyWithEquipment: 600, channels: 10 },
        { name: 'SIP ILIMITADO 20 Canais', type: 'PLANO', setup: 500, monthly: 650, monthlyWithEquipment: 800, channels: 20 },
        { name: 'SIP ILIMITADO 30 Canais', type: 'PLANO', setup: 500, monthly: 850, monthlyWithEquipment: 950, channels: 30 },
        { name: 'SIP ILIMITADO 60 Canais', type: 'PLANO', setup: 500, monthly: 1600, monthlyWithEquipment: 1700, channels: 60 },
    ];

    const costPerAdditionalChannel = 50;
    const equipmentRentalCost = 35;

    // Lógica de Cálculo
    const calculatePabxPrice = () => {
        if (pabxExtensions <= 0) {
            setPabxResult(null);
            return;
        }

        const tier = pabxTiers.find(t => pabxExtensions >= t.min && pabxExtensions <= t.max);
        if (!tier) {
            setPabxResult(null);
            return;
        }

        let setup = pabxIncludeSetup ? tier.setup : 0;
        let baseMonthly = tier.monthly * pabxExtensions;
        let deviceRentalCost = 0;
        let aiAgentCost = 0;

        if (pabxIncludeDevices) {
            deviceRentalCost = pabxDeviceQuantity * 35; // R$ 35 por dispositivo
        }

        if (includeAIAgent) {
            const plan = Object.values(aiAgentPlans).find(p => p.name === selectedAIAgentPlan);
            if (plan) {
                aiAgentCost = plan.monthlyCost;
            }
        }

        const totalMonthly = baseMonthly + deviceRentalCost + aiAgentCost;
        setPabxResult({ setup, baseMonthly, deviceRentalCost, aiAgentCost, totalMonthly });
    };

    const calculateSipPrice = () => {
        if (!selectedSipPlan) {
            setSipResult(null);
            return;
        }

        const plan = sipPlans.find(p => p.name === selectedSipPlan);
        if (plan) {
            let monthly = (sipWithEquipment && plan.monthlyWithEquipment) ? plan.monthlyWithEquipment : plan.monthly;
            let additionalChannelsCost = 0;

            if (plan.type === 'TARIFADO' && sipAdditionalChannels > 0) {
                additionalChannelsCost = sipAdditionalChannels * 20; // R$ 20 por canal adicional
                monthly += additionalChannelsCost;
            }

            const setup = sipIncludeSetup ? plan.setup : 0;
            setSipResult({ setup, monthly, additionalChannelsCost });
        } else {
            setSipResult(null);
        }
    };

    // Cálculos VM usando useMemo
    const calculateVMCost = useMemo(() => {
        let cost = 0;

        // Custo de CPU baseado no SO
        if (vmOperatingSystem.includes('Windows')) {
            cost += vmCpuCores * vcpuWindowsCost;
        } else {
            cost += vmCpuCores * vcpuLinuxCost;
        }

        // Custo de RAM
        cost += vmRamGb * ramCost;

        // Custo de Storage
        if (vmStorageType === 'HDD SAS') {
            cost += vmStorageSize * hddSasCost;
        } else if (vmStorageType === 'SSD Performance') {
            cost += vmStorageSize * ssdPerformanceCost;
        } else if (vmStorageType === 'NVMe') {
            cost += vmStorageSize * nvmeCost;
        }

        // Custo de Network
        if (vmNetworkSpeed === '10 Gbps') {
            cost += network10GbpsCost;
        }

        // Custo do Sistema Operacional
        if (vmOperatingSystem === 'Windows Server 2022 Standard') {
            cost += windowsServerCost;
        } else if (vmOperatingSystem === 'Windows 10 Pro') {
            cost += windows10ProCost;
        } else if (vmOperatingSystem === 'Windows 11 Pro') {
            cost += windows11ProCost;
        }

        // Serviços adicionais
        if (vmBackupSize > 0) {
            cost += vmBackupSize * backupCostPerGb;
        }
        if (vmAdditionalIp) {
            cost += additionalIpCost;
        }
        if (vmSnapshot) {
            cost += snapshotCost;
        }
        if (vmVpnSiteToSite) {
            cost += vpnSiteToSiteCost;
        }

        return cost;
    }, [
        vmCpuCores, vmRamGb, vmStorageType, vmStorageSize, vmNetworkSpeed, vmOperatingSystem,
        vmBackupSize, vmAdditionalIp, vmSnapshot, vmVpnSiteToSite,
        vcpuWindowsCost, vcpuLinuxCost, ramCost, hddSasCost, ssdPerformanceCost, nvmeCost,
        network10GbpsCost, windowsServerCost, windows10ProCost, windows11ProCost, backupCostPerGb,
        additionalIpCost, snapshotCost, vpnSiteToSiteCost
    ]);

    // Função para obter taxa de comissão do Parceiro Indicador usando as tabelas editáveis
    const getReferralPartnerCommissionRate = (monthlyRevenue: number, contractMonths: number): number => {
        if (!channelIndicator || !includeReferralPartner) return 0;
        return getChannelIndicatorCommissionRate(channelIndicator, monthlyRevenue, contractMonths);
    };

    // Função para obter taxa de comissão do Parceiro Influenciador usando as tabelas editáveis
    const getInfluencerPartnerCommissionRate = (monthlyRevenue: number, contractMonths: number): number => {
        if (!channelInfluencer || !includeInfluencerPartner) return 0;
        return getChannelInfluencerCommissionRate(channelInfluencer, monthlyRevenue, contractMonths);
    };

    // Cálculo detalhado de custos e margens
    const {
        vmFinalPrice,
        markupValue,
        commissionValue,
        estimatedNetMargin,
        realMarkupPercentage,
        costBreakdown
    } = useMemo(() => {
        const C = calculateVMCost;
        const M = markup / 100;
        const Comm = commissionPercentage / 100;
        const T_rev = revenueTaxes;
        const T_profit = profitTaxes;

        const denominator = 1 - Comm - T_rev;
        const priceBeforeDiscounts = denominator > 0 ? (C * (1 + M)) / denominator : 0;

        const contractDiscountAmount = priceBeforeDiscounts * (contractDiscount / 100);
        const priceAfterContractDiscount = priceBeforeDiscounts - contractDiscountAmount;

        const directorDiscountAmount = priceAfterContractDiscount * (appliedDirectorDiscountPercentage / 100);
        const priceAfterDirectorDiscount = priceAfterContractDiscount - directorDiscountAmount;

        // Calcular a comissão correta baseado na presença de parceiros
        const temParceiros = includeReferralPartner || includeInfluencerPartner;
        const calculatedCommissionValue = temParceiros
            ? (priceAfterDirectorDiscount * (getChannelSellerCommissionRate(channelSeller, vmContractPeriod) / 100)) // Canal/Vendedor quando há parceiros
            : (priceAfterDirectorDiscount * (getSellerCommissionRate(seller, vmContractPeriod) / 100)); // Vendedor quando não há parceiros
        const revenueTaxValue = priceAfterDirectorDiscount * T_rev;

        const calculatedReferralPartnerCommission = (() => {
            if (!includeReferralPartner) {
                return 0;
            }
            const monthlyRevenue = priceAfterDirectorDiscount;
            const commissionRate = getReferralPartnerCommissionRate(monthlyRevenue, vmContractPeriod);
            return monthlyRevenue * (commissionRate / 100);
        })();

        const calculatedInfluencerPartnerCommission = (() => {
            if (!includeInfluencerPartner) {
                return 0;
            }
            const monthlyRevenue = priceAfterDirectorDiscount;
            const commissionRate = getInfluencerPartnerCommissionRate(monthlyRevenue, vmContractPeriod);
            return monthlyRevenue * (commissionRate / 100);
        })();

        const finalPrice = priceAfterDirectorDiscount - calculatedReferralPartnerCommission - calculatedInfluencerPartnerCommission;

        // Correct DRE calculation structure:
        // 1. Gross Revenue
        const grossRevenue = finalPrice;

        // 2. Revenue Taxes (PIS + COFINS) - REMOVED
        const revenueOnlyTaxes = 0;

        // 3. Net Revenue (no revenue taxes)
        const netRevenue = grossRevenue;

        // 4. Direct Costs (VM operational costs)
        const directCosts = C;

        // 5. Gross Profit (after direct costs)
        const grossProfit = netRevenue - directCosts;

        // 6. Commercial Expenses (commissions)
        const totalCommissions = calculatedCommissionValue + calculatedReferralPartnerCommission + calculatedInfluencerPartnerCommission;

        // 7. Profit after commercial expenses
        const profitAfterCommissions = grossProfit - totalCommissions;

        // 8. Profit Taxes (CSLL + IRPJ) - REMOVED
        const profitTaxValue = 0;

        // 9. Net Profit (no profit taxes)
        const netProfit = profitAfterCommissions;

        const calculatedNetMargin = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;
        const calculatedMarkupValue = C * M; // This represents the actual markup amount added to cost

        // Calcular o markup real baseado no lucro líquido e custo total
        const totalCostWithCommissions = directCosts + totalCommissions;
        const realMarkupPercentage = totalCostWithCommissions > 0 ? (netProfit / totalCostWithCommissions) * 100 : 0;

        return {
            vmFinalPrice: Math.max(0, finalPrice) || 0,
            markupValue: Math.max(0, calculatedMarkupValue) || 0,
            commissionValue: Math.max(0, calculatedCommissionValue) || 0,
            estimatedNetMargin: calculatedNetMargin || 0,
            realMarkupPercentage: realMarkupPercentage || 0,
            costBreakdown: {
                baseCost: C,
                taxAmount: 0,
                totalCostWithTaxes: C,
                markupAmount: calculatedMarkupValue,
                priceBeforeDiscounts,
                contractDiscount: {
                    percentage: contractDiscount,
                    amount: contractDiscountAmount
                },
                directorDiscount: {
                    percentage: appliedDirectorDiscountPercentage,
                    amount: directorDiscountAmount
                },
                finalPrice,
                grossRevenue,
                netRevenue,
                directCosts,
                totalCommissions,
                profitAfterCommissions,
                totalCost: C + calculatedCommissionValue,
                grossProfit,
                netMargin: calculatedNetMargin,
                referralPartnerCommission: calculatedReferralPartnerCommission,
                influencerPartnerCommission: calculatedInfluencerPartnerCommission,
                netProfit,
                revenueTaxValue: revenueOnlyTaxes,
                profitTaxValue,
                commissionValue: calculatedCommissionValue,
                cost: C,
                setupFee: setupFee
            }
        };
    }, [calculateVMCost, revenueTaxes, profitTaxes, markup, contractDiscount, commissionPercentage, appliedDirectorDiscountPercentage, includeReferralPartner, includeInfluencerPartner, setupFee]);





    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Funções de manipulação
    const handleAddVMProduct = () => {
        // Criar descrição completa incluindo serviços adicionais
        let description = `${vmQuantity}x ${vmName} - ${vmCpuCores} vCPU, ${vmRamGb}GB RAM, ${vmStorageSize}GB ${vmStorageType}, ${vmOperatingSystem}`;

        // Adicionar serviços adicionais na descrição
        const additionalServices = [];
        if (vmBackupSize > 0) additionalServices.push(`Backup ${vmBackupSize}GB`);
        if (vmAdditionalIp) additionalServices.push('IP Adicional');
        if (vmSnapshot) additionalServices.push('Snapshot');
        if (vmVpnSiteToSite) additionalServices.push('VPN Site-to-Site');

        if (additionalServices.length > 0) {
            description += ` - ${additionalServices.join(', ')}`;
        }

        const newProduct: Product = {
            id: Date.now().toString(),
            type: 'VM' as ProductType,
            description: description,
            setup: setupFee * vmQuantity, // Multiplicar pela quantidade
            monthly: vmFinalPrice * vmQuantity, // Multiplicar pela quantidade
            details: {
                quantity: vmQuantity, // Adicionar quantidade nos detalhes
                cpuCores: vmCpuCores,
                ramGb: vmRamGb,
                storageType: vmStorageType,
                storageSize: vmStorageSize,
                networkSpeed: vmNetworkSpeed,
                operatingSystem: vmOperatingSystem,
                backupSize: vmBackupSize,
                additionalIp: vmAdditionalIp,
                snapshot: vmSnapshot,
                vpnSiteToSite: vmVpnSiteToSite,
                contractPeriod: vmContractPeriod,
                unitSetup: setupFee, // Valor unitário do setup
                unitMonthly: vmFinalPrice // Valor unitário mensal
            }
        };
        setAddedProducts([...addedProducts, newProduct]);
    };

    const handleRemoveProduct = (productId: string) => {
        setAddedProducts(addedProducts.filter(p => p.id !== productId));
    };

    const handleTaxRegimeChange = (regime: string) => {
        setSelectedTaxRegime(regime);

        // Definir valores padrão para cada regime
        switch (regime) {
            case 'lucro_real':
                setPisCofins('3,65');
                setIss('5,00');
                setCsllIr('8,88');
                break;
            case 'lucro_presumido':
                setPisCofins('3,65');
                setIss('5,00');
                setCsllIr('4,80');
                break;
            case 'lucro_real_reduzido':
                setPisCofins('1,65');
                setIss('2,00');
                setCsllIr('4,80');
                break;
            case 'simples_nacional':
                setPisCofins('15,00');
                setIss('0,00');
                setCsllIr('0,00');
                break;
            default:
                break;
        }
    };

    const createNewProposal = () => {
        setCurrentProposal(null);
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);

        // Handle client data - check if it's an object or string
        if (typeof proposal.client === 'object' && proposal.client !== null) {
            setClientData(proposal.client);
        } else if (typeof proposal.client === 'string') {
            setClientData({
                name: proposal.client,
                contact: '',
                projectName: '',
                email: '',
                phone: ''
            });
        } else if (proposal.clientData) {
            setClientData(proposal.clientData);
        }

        // Handle account manager data
        if (proposal.accountManager) {
            setAccountManagerData(proposal.accountManager);
        }

        // Handle products - check multiple possible locations and formats
        let products: Product[] = [];
        if (proposal.products && Array.isArray(proposal.products)) {
            products = proposal.products;
        } else if (proposal.items && Array.isArray(proposal.items)) {
            // Convert items to products format if needed
            products = proposal.items.map((item: any) => ({
                id: item.id || `item-${Date.now()}`,
                type: 'VM',
                description: item.description || 'Máquina Virtual',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }

        setAddedProducts(products);
        setSelectedStatus(proposal.status); // Load the status

        // Load contract period
        if (proposal.contractPeriod) {
            setVmContractPeriod(proposal.contractPeriod);
        }

        // Load VM specific data from the first product if available
        if (products && products.length > 0) {
            const firstProduct = products[0];
            if (firstProduct.details) {
                // Carregar configurações da VM
                if (firstProduct.details.cpuCores) setVmCpuCores(firstProduct.details.cpuCores);
                if (firstProduct.details.ramGb) setVmRamGb(firstProduct.details.ramGb);
                if (firstProduct.details.storageType) setVmStorageType(firstProduct.details.storageType);
                if (firstProduct.details.storageSize) setVmStorageSize(firstProduct.details.storageSize);
                if (firstProduct.details.networkSpeed) setVmNetworkSpeed(firstProduct.details.networkSpeed);
                if (firstProduct.details.operatingSystem) setVmOperatingSystem(firstProduct.details.operatingSystem);

                // Carregar serviços adicionais
                if (firstProduct.details.backupSize !== undefined) setVmBackupSize(firstProduct.details.backupSize);
                if (firstProduct.details.additionalIp !== undefined) setVmAdditionalIp(firstProduct.details.additionalIp);
                if (firstProduct.details.snapshot !== undefined) setVmSnapshot(firstProduct.details.snapshot);
                if (firstProduct.details.vpnSiteToSite !== undefined) setVmVpnSiteToSite(firstProduct.details.vpnSiteToSite);
            }
        }

        // Load discount settings if available
        if (proposal.applySalespersonDiscount !== undefined) {
            setApplySalespersonDiscount(proposal.applySalespersonDiscount);
        }
        if (proposal.appliedDirectorDiscountPercentage !== undefined) {
            setAppliedDirectorDiscountPercentage(proposal.appliedDirectorDiscountPercentage);
        }

        setViewMode('calculator');
    };

    const viewProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);

        // Handle client data - check if it's an object or string
        if (typeof proposal.client === 'object' && proposal.client !== null) {
            setClientData(proposal.client);
        } else if (typeof proposal.client === 'string') {
            setClientData({
                name: proposal.client,
                contact: '',
                projectName: '',
                email: '',
                phone: ''
            });
        } else if (proposal.clientData) {
            setClientData(proposal.clientData);
        }

        // Handle account manager data
        if (proposal.accountManager) {
            setAccountManagerData(proposal.accountManager);
        }

        // Handle products - check multiple possible locations and formats
        let products: Product[] = [];
        if (proposal.products && Array.isArray(proposal.products)) {
            products = proposal.products;
        } else if (proposal.items && Array.isArray(proposal.items)) {
            // Convert items to products format if needed
            products = proposal.items.map((item: any) => ({
                id: item.id || `item-${Date.now()}`,
                type: 'VM',
                description: item.description || 'Máquina Virtual',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }

        setAddedProducts(products);
        setSelectedStatus(proposal.status);

        // Load contract period
        if (proposal.contractPeriod) {
            setVmContractPeriod(proposal.contractPeriod);
        }

        // Load VM specific data from the first product if available
        if (products && products.length > 0) {
            const firstProduct = products[0];
            if (firstProduct.details) {
                // Carregar configurações da VM
                if (firstProduct.details.cpuCores) setVmCpuCores(firstProduct.details.cpuCores);
                if (firstProduct.details.ramGb) setVmRamGb(firstProduct.details.ramGb);
                if (firstProduct.details.storageType) setVmStorageType(firstProduct.details.storageType);
                if (firstProduct.details.storageSize) setVmStorageSize(firstProduct.details.storageSize);
                if (firstProduct.details.networkSpeed) setVmNetworkSpeed(firstProduct.details.networkSpeed);
                if (firstProduct.details.operatingSystem) setVmOperatingSystem(firstProduct.details.operatingSystem);

                // Carregar serviços adicionais
                if (firstProduct.details.backupSize !== undefined) setVmBackupSize(firstProduct.details.backupSize);
                if (firstProduct.details.additionalIp !== undefined) setVmAdditionalIp(firstProduct.details.additionalIp);
                if (firstProduct.details.snapshot !== undefined) setVmSnapshot(firstProduct.details.snapshot);
                if (firstProduct.details.vpnSiteToSite !== undefined) setVmVpnSiteToSite(firstProduct.details.vpnSiteToSite);
            }
        }

        setViewMode('proposal-summary');
    };

    const deleteProposal = async (proposalId: string) => {
        if (!currentUser) {
            console.error('Usuário não autenticado');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                const response = await fetch(`/api/proposals?id=${proposalId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                    },
                });

                if (response.ok) {
                    fetchProposals();
                    if (currentProposal?.id === proposalId) {
                        setCurrentProposal(null);
                    }
                    toast.success('Proposta excluída com sucesso!');
                } else {
                    throw new Error('Erro ao excluir proposta');
                }
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                toast.error('Falha ao excluir a proposta.');
            }
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
                
                .proposal-view, .proposal-view * {
                    visibility: visible;
                }
                
                .proposal-view {
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

        // Add proposal-view class to the proposal summary
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

    const handleTaxRateChange = (taxType: keyof typeof taxRates, value: number) => {
        console.log(`Changing ${taxType} to ${value}`);

        // Ensure the value is a valid number and not negative
        const validValue = isNaN(value) || value < 0 ? 0 : value;

        const newTaxRates = { ...taxRates, [taxType]: validValue };
        console.log('New tax rates:', newTaxRates);
        setTaxRates(newTaxRates);

        // Save to localStorage
        localStorage.setItem('vmTaxRates', JSON.stringify(newTaxRates));
    };

    const handleSaveSettings = async () => {
        console.log('handleSaveSettings called');
        console.log('Current setupFee:', setupFee);
        console.log('Current managementAndSupportCost:', managementAndSupportCost);

        if (!currentUser) {
            toast.error('Você precisa estar logado para salvar as configurações.');
            return;
        }

        try {
            const settingsToSave = {
                markup,
                commissionPercentage,
                setupFee,
                managementAndSupportCost,
                vcpuWindowsCost,
                vcpuLinuxCost,
                ramCost,
                hddSasCost,
                ssdPerformanceCost,
                nvmeCost,
                network1GbpsCost,
                network10GbpsCost,
                windowsServerCost,
                windows10ProCost,
                windows11ProCost,
                ubuntuCost,
                centosCost,
                debianCost,
                rockyLinuxCost,
                backupCostPerGb,
                additionalIpCost,
                snapshotCost,
                vpnSiteToSiteCost,
                pisCofins: parseFloat(pisCofins.replace(',', '.')),
                iss: parseFloat(iss.replace(',', '.')),
                csllIr: parseFloat(csllIr.replace(',', '.')),
                contractDiscounts,
                taxRates,
                vmQuantity,
                updatedAt: new Date().toISOString(),
                userId: currentUser.id
            };

            console.log('Saving settings:', settingsToSave);
            console.log('setupFee in settingsToSave:', settingsToSave.setupFee);
            console.log('managementAndSupportCost in settingsToSave:', settingsToSave.managementAndSupportCost);

            // Save to localStorage as fallback
            localStorage.setItem(`vmPricingSettings_${currentUser.id}`, JSON.stringify(settingsToSave));
            console.log('Saved to localStorage with key:', `vmPricingSettings_${currentUser.id}`);

            // Try to save via API
            const response = await fetch('/api/vm-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsToSave),
            });

            if (response.ok) {
                toast.success('Configurações salvas com sucesso!');
                setHasChanged(false);
            } else {
                // If API fails, at least we have localStorage
                console.warn('API save failed, but localStorage backup successful');
                toast.success('Configurações salvas localmente!');
            }
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            // Try localStorage as fallback
            try {
                const settingsToSave = {
                    markup,
                    commissionPercentage,
                    setupFee,
                    managementAndSupportCost,
                    vcpuWindowsCost,
                    vcpuLinuxCost,
                    ramCost,
                    hddSasCost,
                    ssdPerformanceCost,
                    nvmeCost,
                    network1GbpsCost,
                    network10GbpsCost,
                    windowsServerCost,
                    windows10ProCost,
                    windows11ProCost,
                    ubuntuCost,
                    centosCost,
                    debianCost,
                    rockyLinuxCost,
                    backupCostPerGb,
                    additionalIpCost,
                    snapshotCost,
                    vpnSiteToSiteCost,
                    pisCofins: parseFloat(pisCofins.replace(',', '.')),
                    iss: parseFloat(iss.replace(',', '.')),
                    csllIr: parseFloat(csllIr.replace(',', '.')),
                    contractDiscounts,
                    taxRates,
                    updatedAt: new Date().toISOString(),
                    userId: currentUser.id
                };
                localStorage.setItem(`vmPricingSettings_${currentUser.id}`, JSON.stringify(settingsToSave));
                toast.success('Configurações salvas localmente!');
            } catch (localError) {
                console.error("Erro ao salvar no localStorage:", localError);
                toast.error('Falha ao salvar as configurações.');
            }
        }
    };

    // Funções para gerenciar propostas já implementadas acima

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

    // Função para salvar proposta
    const saveProposal = async () => {
        if (!currentUser) {
            alert('Erro: Usuário não autenticado');
            return;
        }

        // Validar dados obrigatórios
        if (!clientData || !clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }

        if (!accountManagerData || !accountManagerData.name) {
            alert('Por favor, preencha os dados do gerente de contas antes de salvar.');
            return;
        }

        if (addedProducts.length === 0) {
            alert('Por favor, adicione pelo menos um produto antes de salvar.');
            return;
        }

        try {
            const baseTotalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
            const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);

            // Aplicar descontos no total mensal
            const finalTotalMonthly = applyDiscounts(baseTotalMonthly);
            const proposalVersion = getProposalVersion();

            const proposalToSave = {
                title: `Proposta Máquinas Virtuais V${proposalVersion} - ${clientData.companyName || clientData.name || 'Cliente'}`,
                client: clientData.companyName || clientData.name || 'Cliente não informado',
                value: finalTotalMonthly,
                type: 'VM',
                status: 'Rascunho',
                createdBy: currentUser.email || currentUser.id,
                createdAt: new Date().toISOString(),
                version: proposalVersion,
                // Store additional data as metadata
                clientData: clientData,
                accountManager: accountManagerData,
                products: addedProducts,
                totalSetup: totalSetup,
                totalMonthly: finalTotalMonthly,
                contractPeriod: vmContractPeriod, // Incluir período do contrato
                baseTotalMonthly: baseTotalMonthly,
                applySalespersonDiscount: applySalespersonDiscount,
                appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage,
                userId: currentUser.id
            };

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proposalToSave),
            });

            if (response.ok) {
                const savedProposal = await response.json();
                alert(`Proposta ${savedProposal.baseId || savedProposal.id} salva com sucesso!`);
                setCurrentProposal(savedProposal);
                // Atualizar lista de propostas
                fetchProposals();
                // Limpar formulário após salvar
                setViewMode('search');
            } else {
                throw new Error('Erro ao salvar proposta');
            }
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Erro ao salvar proposta. Por favor, tente novamente.');
        }
    };

    // Função para salvar a proposta (usando apenas API)
    const handleSave = async (proposalId?: string, saveAsNewVersion: boolean = false) => {
        if (!currentUser?.id) {
            alert('Usuário não autenticado');
            return;
        }

        // Validar dados obrigatórios
        if (!clientData || !clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }

        if (!accountManagerData || !accountManagerData.name) {
            alert('Por favor, preencha os dados do gerente de contas antes de salvar.');
            return;
        }

        if (addedProducts.length === 0) {
            alert('Por favor, adicione pelo menos um produto antes de salvar.');
            return;
        }

        try {
            setSaving(true);

            // Calcular totais
            const baseTotalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
            const calculatedTotalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
            const finalTotalMonthly = applyDiscounts(baseTotalMonthly);

            // Determinar versão
            let version = 1;
            if (saveAsNewVersion && currentProposal) {
                version = (currentProposal.version || 1) + 1;
            } else if (currentProposal) {
                version = currentProposal.version || 1;
            }

            // Preparar dados da proposta
            const proposalData = {
                title: `Proposta VM V${version} - ${clientData?.name || 'Cliente'}`,
                client: clientData?.name || '',
                type: 'VM',
                value: finalTotalMonthly,
                status: 'Rascunho' as const,
                createdBy: currentUser.id,
                accountManager: accountManagerData?.name || '',
                date: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
                totalSetup: calculatedTotalSetup,
                totalMonthly: finalTotalMonthly,
                contractPeriod: vmContractPeriod,
                version: version,
                clientData: clientData,
                products: addedProducts,
                items: addedProducts,
                // Dados adicionais para controle de versão
                applySalespersonDiscount: applySalespersonDiscount,
                appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage,
                baseTotalMonthly: baseTotalMonthly
            };

            let response;

            if (saveAsNewVersion || !proposalId) {
                // Criar nova proposta/versão
                response = await fetch('/api/proposals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(proposalData),
                });
            } else {
                // Atualizar proposta existente
                response = await fetch(`/api/proposals?id=${proposalId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(proposalData),
                });
            }

            if (response.ok) {
                const savedProposal = await response.json();
                const actionText = saveAsNewVersion ? 'Nova versão criada' : 'Proposta salva';
                alert(`${actionText} com sucesso! ID: ${savedProposal.baseId || savedProposal.id}`);
                setCurrentProposal(savedProposal);
                setHasChanged(false);
                // Atualizar lista de propostas
                fetchProposals();
            } else {
                const errorData = await response.json();
                console.error('Erro ao salvar proposta:', errorData);
                alert('Erro ao salvar proposta: ' + (errorData.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Erro ao salvar proposta. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    // Tela de resumo da proposta (visualização / impressão)
    if (viewMode === 'proposal-summary' && currentProposal) {
        return (
            <div className="p-4 md:p-8">
                <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                    <CardHeader className="print:pb-2">
                        <div className="flex justify-between items-start mb-4 print:mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-gray-600">Máquinas Virtuais</p>
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
                        {/* Dados do Cliente, Projeto e Gerente */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {
                                        typeof currentProposal.client === 'object' && currentProposal.client?.name
                                            ? currentProposal.client.name
                                            : currentProposal.clientData?.name ||
                                            (typeof currentProposal.client === 'string' ? currentProposal.client : 'N/A')
                                    }</p>
                                    <p><strong>Email:</strong> {
                                        typeof currentProposal.client === 'object' && currentProposal.client?.email
                                            ? currentProposal.client.email
                                            : currentProposal.clientData?.email || 'N/A'
                                    }</p>
                                    <p><strong>Telefone:</strong> {
                                        typeof currentProposal.client === 'object' && currentProposal.client?.phone
                                            ? currentProposal.client.phone
                                            : currentProposal.clientData?.phone || 'N/A'
                                    }</p>
                                    <p><strong>Contato:</strong> {
                                        typeof currentProposal.client === 'object' && currentProposal.client?.contact
                                            ? currentProposal.client.contact
                                            : currentProposal.clientData?.contact || 'N/A'
                                    }</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nome do Projeto</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium text-base">{
                                        typeof currentProposal.client === 'object' && currentProposal.client?.projectName
                                            ? currentProposal.client.projectName
                                            : currentProposal.clientData?.projectName || 'Projeto não informado'
                                    }</p>
                                    <p className="text-gray-600 text-xs mt-2">
                                        <strong>ID da Proposta:</strong> {currentProposal.baseId || currentProposal.id}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        <strong>Versão:</strong> v{currentProposal.version || 1}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        <strong>Período do Contrato:</strong> {currentProposal.contractPeriod ? `${currentProposal.contractPeriod} meses` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.accountManager?.name || 'N/A'}</p>
                                    <p><strong>Email:</strong> {currentProposal.accountManager?.email || 'N/A'}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.accountManager?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Produtos e Serviços */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Produtos e Serviços</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-900">Descrição</TableHead>
                                        <TableHead className="text-gray-900">Setup</TableHead>
                                        <TableHead className="text-gray-900">Mensal/VM</TableHead>
                                        <TableHead className="text-gray-900">Mensal Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(currentProposal.products ?? []).map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>{formatCurrency(product.setup)}</TableCell>
                                            <TableCell>
                                                {product.details?.unitMonthly ? formatCurrency(product.details.unitMonthly) :
                                                    (product.details?.quantity ? formatCurrency(product.monthly / product.details.quantity) : formatCurrency(product.monthly))}
                                            </TableCell>
                                            <TableCell>{formatCurrency(product.monthly)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="border-t pt-4 print:pt-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p><strong>Total Setup:</strong> {formatCurrency(currentProposal.totalSetup)}</p>
                                    <p><strong>Total Mensal:</strong> {formatCurrency(currentProposal.totalMonthly)}</p>
                                    <p><strong>Período do Contrato:</strong> {currentProposal.contractPeriod || 12} meses</p>
                                    <p><strong>Total do Contrato:</strong> {formatCurrency((currentProposal.totalMonthly || 0) * (currentProposal.contractPeriod || 12))}</p>
                                </div>
                                <div>
                                    <p><strong>Data da Proposta:</strong> {currentProposal.createdAt ? (
                                        (typeof currentProposal.createdAt === 'object' && 'toDate' in currentProposal.createdAt)
                                            ? new Date(currentProposal.createdAt.toDate()).toLocaleDateString('pt-BR')
                                            : (isNaN(new Date(currentProposal.createdAt).getTime()) ? 'N/A' : new Date(currentProposal.createdAt).toLocaleDateString('pt-BR'))
                                    ) : 'N/A'}</p>
                                    <p><strong>Status:</strong> {currentProposal.status}</p>
                                    <p><strong>Data de Validade:</strong> {currentProposal.expiryDate ? new Date(currentProposal.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 print-hide">
                {viewMode === 'search' ? (
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <Button
                                variant="outline"
                                onClick={() => setViewMode('calculator')}
                                className="flex items-center mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <CardTitle>Buscar Propostas</CardTitle>
                            <CardDescription>Encontre propostas existentes ou crie uma nova.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm bg-slate-800 border-slate-700 text-white"
                                />
                                <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Proposta
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-white">ID</TableHead>
                                            <TableHead className="text-white">Cliente</TableHead>
                                            <TableHead className="text-white">Nome do Projeto</TableHead>
                                            <TableHead className="text-white">Data</TableHead>
                                            <TableHead className="text-white">Total Mensal</TableHead>
                                            <TableHead className="text-white">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(filteredProposals ?? []).length === 0 ? (
                                            <TableRow key="no-proposals-found">
                                                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                                                    No proposal found. Click on "New Proposal" to start.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProposals.map((p: Proposal) => (
                                                <TableRow key={p.id} className="border-slate-800">
                                                    <TableCell>{p.baseId || p.id}</TableCell>
                                                    <TableCell>{typeof p.client === 'string' ? p.client : p.client?.name || 'Sem nome'} (v{p.version})</TableCell>
                                                    <TableCell>{
                                                        typeof p.client === 'object' && p.client?.projectName
                                                            ? p.client.projectName
                                                            : p.clientData?.projectName || 'Projeto não informado'
                                                    }</TableCell>
                                                    <TableCell>{p.createdAt ? (
                                                        (typeof p.createdAt === 'object' && 'toDate' in p.createdAt)
                                                            ? new Date(p.createdAt.toDate()).toLocaleDateString('pt-BR')
                                                            : (isNaN(new Date(p.createdAt).getTime()) ? 'N/A' : new Date(p.createdAt).toLocaleDateString('pt-BR'))
                                                    ) : 'N/A'}</TableCell>
                                                    <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                                onClick={() => viewProposal(p)}
                                                            >
                                                                <FilePenLine className="h-4 w-4 mr-2" /> Visualizar
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-600 text-blue-300 hover:bg-blue-700"
                                                                onClick={() => editProposal(p)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => deleteProposal(p.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Calculadora de Máquinas Virtuais</h1>
                                    <p className="text-slate-400 mt-2">Configure e calcule os custos para VMs na nuvem</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setViewMode('search')}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        ← Voltar para Buscar
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
                            {viewMode === 'client-form' || showClientForm ? (
                                <ClientManagerForm
                                    clientData={clientData}
                                    accountManagerData={accountManagerData}
                                    onClientDataChange={setClientData}
                                    onAccountManagerDataChange={setAccountManagerData}
                                    onBack={() => {
                                        setShowClientForm(false);
                                        if (viewMode === 'client-form') {
                                            setViewMode('search');
                                        }
                                    }}
                                    onContinue={() => {
                                        setShowClientForm(false);
                                        if (viewMode === 'client-form') {
                                            setViewMode('calculator');
                                        }
                                    }}
                                />
                            ) : (
                                <ClientManagerInfo
                                    clientData={clientData}
                                    accountManagerData={accountManagerData}
                                />
                            )}
                        </div>

                        {viewMode === 'calculator' && (
                            <>
                                <div>
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className={`grid w-full ${currentUser?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} bg-slate-800`}>
                                            <TabsTrigger value="calculator">Calculadora VM</TabsTrigger>
                                            {currentUser?.role === 'admin' && (
                                                <TabsTrigger value="list-price">Tabela de Preços VM/Configurações</TabsTrigger>
                                            )}
                                            {currentUser?.role === 'admin' && (
                                                <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                                            )}
                                            {currentUser?.role === 'admin' && (
                                                <TabsTrigger value="dre">DRE</TabsTrigger>
                                            )}
                                        </TabsList>
                                        <TabsContent value="calculator">
                                            <div className="mt-6">
                                                {/* Configurar Máquina Virtual */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <div className="flex justify-between items-center">
                                                            <CardTitle className="text-cyan-400 flex items-center gap-2">
                                                                <Server className="h-5 w-5" />
                                                                Configurar Máquina Virtual
                                                            </CardTitle>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" className="bg-blue-600 text-white border-blue-600">
                                                                    <Brain className="h-4 w-4 mr-2" />
                                                                    Sugestão IA
                                                                </Button>
                                                                <Button variant="outline" className="bg-blue-600 text-white border-blue-600">
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Adicionar à Proposta
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        {/* Nome da VM */}
                                                        <div>
                                                            <Label className="mb-2 block text-white">
                                                                Nome da VM
                                                            </Label>
                                                            <Input
                                                                value={vmName}
                                                                onChange={(e) => setVmName(e.target.value)}
                                                                className="bg-slate-800 border-slate-700 text-white"
                                                            />
                                                        </div>

                                                        {/* vCPU Cores e Memória RAM - Layout compacto */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="mb-2 block text-white">
                                                                    vCPU Cores
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={vmCpuCores}
                                                                    onChange={(e) => setVmCpuCores(Number(e.target.value))}
                                                                    className="bg-slate-800 border-slate-700 text-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="mb-2 block text-white">
                                                                    Memória RAM (GB)
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={vmRamGb}
                                                                    onChange={(e) => setVmRamGb(Number(e.target.value))}
                                                                    className="bg-slate-800 border-slate-700 text-white"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Tipo de Armazenamento */}
                                                        <div>
                                                            <Label className="mb-2 block text-white">
                                                                Tipo de Armazenamento
                                                            </Label>
                                                            <Select value={vmStorageType} onValueChange={setVmStorageType}>
                                                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-800 text-white">
                                                                    <SelectItem value="HDD SAS">HDD SAS</SelectItem>
                                                                    <SelectItem value="SSD Performance">SSD Performance</SelectItem>
                                                                    <SelectItem value="NVMe">NVMe</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Armazenamento */}
                                                        <div>
                                                            <Label className="mb-2 block text-white">
                                                                Armazenamento {vmStorageType} (GB)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={vmStorageSize}
                                                                onChange={(e) => setVmStorageSize(Number(e.target.value))}
                                                                className="bg-slate-800 border-slate-700 text-white"
                                                            />
                                                        </div>

                                                        {/* Placa de Rede */}
                                                        <div>
                                                            <Label className="mb-2 block text-white">
                                                                Placa de Rede
                                                            </Label>
                                                            <Select value={vmNetworkSpeed} onValueChange={setVmNetworkSpeed}>
                                                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-800 text-white">
                                                                    <SelectItem value="1 Gbps">1 Gbps</SelectItem>
                                                                    <SelectItem value="10 Gbps">10 Gbps</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Sistema Operacional */}
                                                        <div>
                                                            <Label className="mb-2 block text-white">
                                                                Sistema Operacional
                                                            </Label>
                                                            <Select value={vmOperatingSystem} onValueChange={setVmOperatingSystem}>
                                                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-800 text-white">
                                                                    <SelectItem value="Ubuntu Server 22.04 LTS">Ubuntu Server 22.04 LTS</SelectItem>
                                                                    <SelectItem value="Windows Server 2022 Standard">Windows Server 2022 Standard</SelectItem>
                                                                    <SelectItem value="Windows 10 Pro">Windows 10 Pro</SelectItem>
                                                                    <SelectItem value="Windows 11 Pro">Windows 11 Pro</SelectItem>
                                                                    <SelectItem value="CentOS Stream 9">CentOS Stream 9</SelectItem>
                                                                    <SelectItem value="Debian 12">Debian 12</SelectItem>
                                                                    <SelectItem value="Rocky Linux 9">Rocky Linux 9</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Serviços Adicionais */}
                                                        <div>
                                                            <h3 className="text-cyan-400 text-lg font-semibold mb-4">Serviços Adicionais</h3>

                                                            {/* Backup em Bloco */}
                                                            <div className="mb-4">
                                                                <Label className="mb-2 block">
                                                                    Backup em Bloco: <span className="text-cyan-400">{vmBackupSize} GB</span>
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={vmBackupSize}
                                                                    onChange={(e) => setVmBackupSize(Number(e.target.value))}
                                                                    className="bg-slate-800 border-slate-700 text-white"
                                                                    placeholder="0"
                                                                />
                                                            </div>

                                                            {/* Checkboxes para serviços adicionais */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="vmAdditionalIp"
                                                                        checked={vmAdditionalIp}
                                                                        onCheckedChange={(checked) => setVmAdditionalIp(Boolean(checked))}
                                                                        className="border-cyan-400"
                                                                    />
                                                                    <Label htmlFor="vmAdditionalIp" className="text-white">IP Adicional</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="vmSnapshot"
                                                                        checked={vmSnapshot}
                                                                        onCheckedChange={(checked) => setVmSnapshot(Boolean(checked))}
                                                                        className="border-cyan-400"
                                                                    />
                                                                    <Label htmlFor="vmSnapshot" className="text-white">Snapshot Adicional</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="vmVpnSiteToSite"
                                                                        checked={vmVpnSiteToSite}
                                                                        onCheckedChange={(checked) => setVmVpnSiteToSite(Boolean(checked))}
                                                                        className="border-cyan-400"
                                                                    />
                                                                    <Label htmlFor="vmVpnSiteToSite" className="text-white">VPN Site-to-Site</Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Período Contratual */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Settings className="h-5 w-5" />
                                                            <span className="text-cyan-400">Período Contratual</span>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label className="text-white mb-3 block">Selecione o período de contrato:</Label>
                                                                <div className="grid grid-cols-5 gap-3">
                                                                    {[12, 24, 36, 48, 60].map((months) => (
                                                                        <Button
                                                                            key={months}
                                                                            variant={vmContractPeriod === months ? "default" : "outline"}
                                                                            className={`${vmContractPeriod === months
                                                                                ? "bg-cyan-600 text-white border-cyan-600"
                                                                                : "bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
                                                                                }`}
                                                                            onClick={() => setVmContractPeriod(months)}
                                                                        >
                                                                            {months} meses
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-slate-400">
                                                                Período selecionado: <span className="text-cyan-400 font-semibold">{vmContractPeriod} meses</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Incluir Parceiro Indicador */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <User className="h-5 w-5" />
                                                            <span className="text-cyan-400">Parceiro Indicador</span>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="includeReferralPartner"
                                                                checked={includeReferralPartner}
                                                                onCheckedChange={(checked) => setIncludeReferralPartner(Boolean(checked))}
                                                                className="border-cyan-400"
                                                            />
                                                            <Label htmlFor="includeReferralPartner" className="text-white">Incluir Parceiro Indicador</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-4">
                                                            <Checkbox
                                                                id="includeInfluencerPartner"
                                                                checked={includeInfluencerPartner}
                                                                onCheckedChange={(checked) => setIncludeInfluencerPartner(Boolean(checked))}
                                                                className="border-purple-400"
                                                            />
                                                            <Label htmlFor="includeInfluencerPartner" className="text-white">Incluir Parceiro Influenciador</Label>
                                                        </div>
                                                    </CardContent>
                                                </Card>



                                                {/* Resultado do Cálculo da VM */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center">
                                                            <Calculator className="mr-2" />
                                                            Resultado da Configuração
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            {/* Campo de Quantidade */}
                                                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                <Label htmlFor="vm-quantity" className="text-cyan-400 font-semibold">Quantidade de VMs:</Label>
                                                                <div className="flex items-center space-x-2 mt-2">
                                                                    <Input
                                                                        id="vm-quantity"
                                                                        type="number"
                                                                        value={vmQuantity}
                                                                        onChange={(e) => setVmQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                                        min="1"
                                                                        max="100"
                                                                        className="bg-slate-900 border-slate-600 text-white w-20"
                                                                    />
                                                                    <span className="text-sm text-slate-400">
                                                                        {vmQuantity === 1 ? 'VM' : 'VMs'} idêntica{vmQuantity === 1 ? '' : 's'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-cyan-400">Resumo da VM:</Label>
                                                                    <div className="text-sm space-y-1 mt-2">
                                                                        <div>Nome: {vmName}</div>
                                                                        <div>vCPU: {vmCpuCores} cores</div>
                                                                        <div>RAM: {vmRamGb} GB</div>
                                                                        <div>Armazenamento: {vmStorageSize} GB {vmStorageType}</div>
                                                                        <div>Rede: {vmNetworkSpeed}</div>
                                                                        <div>OS: {vmOperatingSystem}</div>
                                                                        <div>Contrato: {vmContractPeriod} meses</div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-cyan-400">Serviços Adicionais:</Label>
                                                                    <div className="text-sm space-y-1 mt-2">
                                                                        {vmBackupSize > 0 && <div>Backup: {vmBackupSize} GB</div>}
                                                                        {vmAdditionalIp && <div>IP Adicional</div>}
                                                                        {vmSnapshot && <div>Snapshot Adicional</div>}
                                                                        {vmVpnSiteToSite && <div>VPN Site-to-Site</div>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="flex-col items-start">
                                                        <div className="w-full">
                                                            <Separator className="bg-slate-700 my-4" />
                                                            <div className="text-lg font-bold mb-2">Cálculo de Preços:</div>
                                                            <div className="space-y-2">
                                                                <div className="text-sm text-slate-400 mb-2">Valores por VM:</div>
                                                                <div className="flex justify-between"><span>• Custo Base (unitário):</span> <span>{formatCurrency(calculateVMCost)}</span></div>
                                                                {contractDiscount > 0 && (
                                                                    <div className="flex justify-between text-orange-400"><span>• Desconto Contrato ({contractDiscount}%):</span> <span>-{formatCurrency(costBreakdown.contractDiscount.amount)}</span></div>
                                                                )}
                                                                <div className="flex justify-between"><span>• Taxa de Setup (unitária):</span> <span>R$ {formatBrazilianNumber(setupFee)}</span></div>
                                                                <div className="flex justify-between text-blue-400"><span>• Subtotal por VM:</span> <span>{formatCurrency(vmFinalPrice)}</span></div>

                                                                <Separator className="bg-slate-700 my-2" />
                                                                <div className="text-sm text-slate-400 mb-2">Valores Totais ({vmQuantity} VM{vmQuantity === 1 ? '' : 's'}):</div>
                                                                <div className="flex justify-between"><span>• Custo Base Total:</span> <span>{formatCurrency(calculateVMCost * vmQuantity)}</span></div>
                                                                {contractDiscount > 0 && (
                                                                    <div className="flex justify-between text-orange-400"><span>• Desconto Total ({contractDiscount}%):</span> <span>-{formatCurrency(costBreakdown.contractDiscount.amount * vmQuantity)}</span></div>
                                                                )}
                                                                <div className="flex justify-between"><span>• Taxa de Setup Total:</span> <span>R$ {formatBrazilianNumber(setupFee * vmQuantity)}</span></div>

                                                                <Separator className="bg-slate-700 my-2" />
                                                                <div className="flex justify-between text-green-400 font-bold text-lg">
                                                                    <span>Total Mensal Final:</span>
                                                                    <span>{formatCurrency(vmFinalPrice * vmQuantity)}</span>
                                                                </div>
                                                                <div className="flex justify-between text-yellow-400 font-bold">
                                                                    <span>Total Setup Final:</span>
                                                                    <span>R$ {formatBrazilianNumber(setupFee * vmQuantity)}</span>
                                                                </div>
                                                                {contractDiscount > 0 && (
                                                                    <div className="text-sm text-orange-400 mt-2">
                                                                        💰 Desconto de {contractDiscount}% aplicado por contrato de {vmContractPeriod} meses
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {currentUser?.role === 'director' && (
                                                                <div className="space-y-2 mt-4">
                                                                    <Label htmlFor="director-discount">Desconto Diretor (%)</Label>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Input
                                                                            id="director-discount"
                                                                            type="number"
                                                                            value={directorDiscountPercentage}
                                                                            onChange={(e) => setDirectorDiscountPercentage(Number(e.target.value))}
                                                                            placeholder="0-100"
                                                                            min="0"
                                                                            max="100"
                                                                            className="bg-slate-800 border-slate-700 text-white"
                                                                        />
                                                                        <Button
                                                                            onClick={() => setAppliedDirectorDiscountPercentage(directorDiscountPercentage)}
                                                                            className="bg-blue-600 hover:bg-blue-700"
                                                                        >
                                                                            Aplicar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="space-y-2 mt-4">
                                                                <Button
                                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                                    onClick={handleAddVMProduct}
                                                                >
                                                                    Adicionar à Proposta
                                                                </Button>
                                                                {addedProducts.length > 0 && (
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                                        onClick={() => setActiveTab('proposal')}
                                                                    >
                                                                        Ver Resumo da Proposta ({addedProducts.length} {addedProducts.length === 1 ? 'item' : 'itens'})
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="commissions-table">
                                            <div className="space-y-6 mt-6">
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center">
                                                            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                                                            Tabela de Comissões - VM
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <CommissionTablesUnified />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>
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
                                                                    <span>Receita Total do Contrato ({vmContractPeriod}m):</span>
                                                                    <span className="text-green-400">{formatCurrency(costBreakdown.finalPrice * vmContractPeriod)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Taxa de Setup:</span>
                                                                    <span className="text-green-400">{formatCurrency(costBreakdown.setupFee)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span>Receita Líquida Total:</span>
                                                                    <span className={costBreakdown.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                                                        {formatCurrency(costBreakdown.netProfit * vmContractPeriod)}
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
                                                        <CardDescription>DRE - Período: {vmContractPeriod} Meses</CardDescription>
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
                                                                {/* Receita Bruta */}
                                                                <TableRow className="border-slate-800 bg-blue-900/30">
                                                                    <TableCell className="text-white font-semibold">Receita Bruta</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossRevenue || costBreakdown.finalPrice)}</TableCell>
                                                                </TableRow>

                                                                {/* Receita Líquida */}
                                                                <TableRow className="border-slate-800 bg-green-900/30">
                                                                    <TableCell className="text-white font-semibold">(=) Receita Líquida</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.netRevenue || costBreakdown.finalPrice)}</TableCell>
                                                                </TableRow>

                                                                {/* Custos Diretos */}
                                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                                    <TableCell className="text-white font-semibold">(-) Custos Diretos</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.directCosts || costBreakdown.cost)}</TableCell>
                                                                </TableRow>
                                                                <TableRow className="border-slate-800">
                                                                    <TableCell className="text-white pl-8">Custo Operacional da VM</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.cost)}</TableCell>
                                                                </TableRow>

                                                                {/* Lucro Bruto */}
                                                                <TableRow className="border-slate-800 bg-blue-900/30">
                                                                    <TableCell className="text-white font-semibold">(=) Lucro Bruto</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit)}</TableCell>
                                                                </TableRow>

                                                                {/* Despesas Comerciais (Comissões) */}
                                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                                    <TableCell className="text-white font-semibold">(-) Despesas Comerciais</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.totalCommissions || (costBreakdown.commissionValue + costBreakdown.referralPartnerCommission))}</TableCell>
                                                                </TableRow>
                                                                <TableRow className="border-slate-800">
                                                                    <TableCell className="text-white pl-8">
                                                                        {(includeReferralPartner || includeInfluencerPartner) ? 'Comissão Canal/Vendedor' : 'Comissão Vendedor'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.commissionValue)}</TableCell>
                                                                </TableRow>
                                                                {includeReferralPartner && (
                                                                    <TableRow className="border-slate-800">
                                                                        <TableCell className="text-white pl-8">Comissão Parceiro Indicador</TableCell>
                                                                        <TableCell className="text-right text-white">{formatCurrency(costBreakdown.referralPartnerCommission)}</TableCell>
                                                                    </TableRow>
                                                                )}
                                                                {includeInfluencerPartner && (
                                                                    <TableRow className="border-slate-800">
                                                                        <TableCell className="text-white pl-8">Comissão Parceiro Influenciador</TableCell>
                                                                        <TableCell className="text-right text-white">{formatCurrency(costBreakdown.influencerPartnerCommission)}</TableCell>
                                                                    </TableRow>
                                                                )}

                                                                {/* Lucro após Despesas Comerciais */}
                                                                <TableRow className="border-slate-800 bg-blue-900/30">
                                                                    <TableCell className="text-white font-semibold">(=) Lucro após Despesas Comerciais</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.profitAfterCommissions || (costBreakdown.grossProfit - (costBreakdown.commissionValue + costBreakdown.referralPartnerCommission + (costBreakdown.influencerPartnerCommission || 0))))}</TableCell>
                                                                </TableRow>

                                                                {/* Taxa Setup (se aplicável) */}
                                                                {costBreakdown.setupFee > 0 && (
                                                                    <TableRow className="border-slate-800">
                                                                        <TableCell className="text-white">Taxa Setup (única)</TableCell>
                                                                        <TableCell className="text-right text-white">{formatCurrency(costBreakdown.setupFee)}</TableCell>
                                                                    </TableRow>
                                                                )}


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
                                                                        {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow className="border-slate-800">
                                                                    <TableCell className="text-white font-semibold">Lucratividade</TableCell>
                                                                    <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
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
                                                                        <span className="text-blue-300 font-semibold">{formatCurrency(costBreakdown.finalPrice)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Total Contrato:</span>
                                                                        <span className="text-blue-300 font-semibold">{formatCurrency(costBreakdown.finalPrice * vmContractPeriod)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Setup:</span>
                                                                        <span className="text-blue-300 font-semibold">{formatCurrency(0)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* CUSTOS */}
                                                            <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-lg border border-red-500/30">
                                                                <h3 className="text-sm font-semibold text-red-300 mb-3 uppercase tracking-wide">CUSTOS</h3>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">VM:</span>
                                                                        <span className="text-red-300 font-semibold">{formatCurrency(costBreakdown.cost)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Comissão:</span>
                                                                        <span className="text-red-300 font-semibold">{formatCurrency(costBreakdown.commissionValue)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* LUCRO */}
                                                            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg border border-green-500/30">
                                                                <h3 className="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wide">LUCRO</h3>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Operacional:</span>
                                                                        <span className={`font-semibold ${costBreakdown.grossProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                            {formatCurrency(costBreakdown.grossProfit)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Líquido:</span>
                                                                        <span className={`font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                            {formatCurrency(costBreakdown.netProfit)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Total Contrato:</span>
                                                                        <span className={`font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                            {formatCurrency(costBreakdown.netProfit * vmContractPeriod)}
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
                                                                        <span className={`font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                                            {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Payback:</span>
                                                                        <span className="text-purple-300 font-semibold">
                                                                            {costBreakdown.netProfit > 0 ? `${Math.ceil(costBreakdown.finalPrice / costBreakdown.netProfit)}m` : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">ROI Total:</span>
                                                                        <span className={`font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                                            {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100 * vmContractPeriod)}%
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
                                                                        {formatCurrency(costBreakdown.finalPrice * vmContractPeriod)}
                                                                    </div>
                                                                    <div className="text-sm text-slate-400">Receita Total ({vmContractPeriod}m)</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className={`text-2xl font-bold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {formatCurrency(costBreakdown.netProfit * vmContractPeriod)}
                                                                    </div>
                                                                    <div className="text-sm text-slate-400">Lucro Total ({vmContractPeriod}m)</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className={`text-2xl font-bold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                                    </div>
                                                                    <div className="text-sm text-slate-400">Margem Líquida</div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="list-price">
                                            <div className="space-y-6 mt-6">

                                                {/* Tributos */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Calculator className="h-5 w-5" />
                                                            Tributos
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex gap-4 mb-6">
                                                            <Button
                                                                variant="outline"
                                                                className={selectedTaxRegime === 'lucro_real' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                                onClick={() => handleTaxRegimeChange('lucro_real')}
                                                            >
                                                                Lucro Real
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className={selectedTaxRegime === 'lucro_presumido' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                                onClick={() => handleTaxRegimeChange('lucro_presumido')}
                                                            >
                                                                Lucro Presumido
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className={selectedTaxRegime === 'lucro_real_reduzido' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                                onClick={() => handleTaxRegimeChange('lucro_real_reduzido')}
                                                            >
                                                                Lucro Real Reduzido
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className={selectedTaxRegime === 'simples_nacional' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                                onClick={() => handleTaxRegimeChange('simples_nacional')}
                                                            >
                                                                Simples Nacional
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-6">
                                                            <div>
                                                                <Label>PIS/COFINS (%)</Label>
                                                                <Input
                                                                    value={pisCofins}
                                                                    onChange={(e) => setPisCofins(e.target.value)}
                                                                    className="bg-slate-800 border-slate-700"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>ISS (%)</Label>
                                                                <Input
                                                                    value={iss}
                                                                    onChange={(e) => setIss(e.target.value)}
                                                                    className="bg-slate-800 border-slate-700"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>CSLL/IR (%)</Label>
                                                                <Input
                                                                    value={csllIr}
                                                                    onChange={(e) => setCsllIr(e.target.value)}
                                                                    className="bg-slate-800 border-slate-700"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 text-center text-cyan-400 text-lg font-semibold">
                                                            Total de Impostos do Regime Selecionado: {(revenueTaxes + profitTaxes).toFixed(2).replace('.', ',')}%
                                                        </div>
                                                        <p className="text-sm text-slate-400 mt-2">
                                                            Edite os impostos de cada regime tributário. Os valores são percentuais e aceitam até 2 casas decimais.
                                                        </p>
                                                    </CardContent>
                                                </Card>

                                                {/* Markup e Margem Líquida */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader>
                                                            <CardTitle className="text-cyan-400">Markup e Margem Líquida</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                <div>
                                                                    <Label htmlFor="markup-config">Markup Config (%)</Label>
                                                                    <Input
                                                                        id="markup-config"
                                                                        type="number"
                                                                        value={markup}
                                                                        onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                                                                        className="bg-slate-800 border-slate-700"
                                                                        placeholder="Ex: 30"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="markup-real">Markup Real (%)</Label>
                                                                    <Input
                                                                        id="markup-real"
                                                                        type="text"
                                                                        value={realMarkupPercentage.toFixed(2) + '%'}
                                                                        readOnly
                                                                        className="bg-slate-800 border-slate-700 text-white cursor-not-allowed"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="estimated-net-margin">Margem Líquida (%)</Label>
                                                                    <Input
                                                                        id="estimated-net-margin"
                                                                        type="text"
                                                                        value={estimatedNetMargin.toFixed(2) + '%'}
                                                                        readOnly
                                                                        className="bg-slate-800 border-slate-700 text-white cursor-not-allowed"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <Separator className="my-4 bg-slate-700" />
                                                            <div className="space-y-2 text-sm">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="text-slate-400">Custo Base:</div>
                                                                    <div className="text-right">{formatCurrency(costBreakdown.baseCost)}</div>

                                                                    <div className="text-green-400">Markup ({markup}%):</div>
                                                                    <div className="text-right text-green-400 font-medium">+{formatCurrency(costBreakdown.markupAmount)}</div>

                                                                    {costBreakdown.contractDiscount.percentage > 0 && (
                                                                        <>
                                                                            <div className="text-orange-400">Desconto Contrato ({costBreakdown.contractDiscount.percentage}%):</div>
                                                                            <div className="text-right text-orange-400">-{formatCurrency(costBreakdown.contractDiscount.amount)}</div>
                                                                        </>
                                                                    )}

                                                                    {costBreakdown.directorDiscount.percentage > 0 && (
                                                                        <>
                                                                            <div className="text-orange-400">Desconto Diretor ({costBreakdown.directorDiscount.percentage}%):</div>
                                                                            <div className="text-right text-orange-400">-{formatCurrency(costBreakdown.directorDiscount.amount)}</div>
                                                                        </>
                                                                    )}

                                                                    <div className="border-t border-slate-700 pt-2 font-semibold">Preço Final:</div>
                                                                    <div className="border-t border-slate-700 pt-2 text-right font-bold">{formatCurrency(costBreakdown.finalPrice)}</div>

                                                                    <div className="text-cyan-400 mt-2">Margem Líquida:</div>
                                                                    <div className="text-right mt-2">
                                                                        <span className={`font-bold ${costBreakdown.netMargin > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                            {costBreakdown.netMargin.toFixed(2)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                </div>

                                                {/* Recursos Base (Custos) */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-cyan-400">Recursos Base (Custos)</CardTitle>
                                                        <div className="flex gap-2">
                                                            {!editingCards.recursosBase ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleCardEdit('recursosBase')}
                                                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('recursosBase')}
                                                                        className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => saveCard('recursosBase')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <Save className="h-4 w-4 mr-1" />
                                                                        Salvar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">vCPU Windows (por core)</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.recursosBase ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(vcpuWindowsCost)}
                                                                            onChange={(e) => { setVcpuWindowsCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(vcpuWindowsCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">vCPU Linux (por core)</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.recursosBase ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(vcpuLinuxCost)}
                                                                            onChange={(e) => { setVcpuLinuxCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(vcpuLinuxCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-6">
                                                            <h4 className="text-cyan-400 mb-4">RAM (por GB)</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                {editingCards.recursosBase ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(ramCost)}
                                                                        onChange={(e) => { setRamCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(ramCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Armazenamento (Custos) */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-cyan-400">Armazenamento (Custos)</CardTitle>
                                                        <div className="flex gap-2">
                                                            {!editingCards.armazenamento ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleCardEdit('armazenamento')}
                                                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('armazenamento')}
                                                                        className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => saveCard('armazenamento')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <Save className="h-4 w-4 mr-1" />
                                                                        Salvar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-4">HDD SAS</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.armazenamento ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(hddSasCost)}
                                                                            onChange={(e) => { setHddSasCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(hddSasCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-4">SSD Performance</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.armazenamento ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(ssdPerformanceCost)}
                                                                            onChange={(e) => { setSsdPerformanceCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(ssdPerformanceCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-4">NVMe</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.armazenamento ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(nvmeCost)}
                                                                            onChange={(e) => { setNvmeCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(nvmeCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Placa de Rede e Sistema Operacional */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">Placa de Rede (Custos)</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.placaRede ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('placaRede')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('placaRede')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('placaRede')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">1 Gbps</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.placaRede ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(network1GbpsCost)}
                                                                            onChange={(e) => { setNetwork1GbpsCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(network1GbpsCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">10 Gbps</h4>
                                                                <div>
                                                                    <Label>Custo Mensal</Label>
                                                                    {editingCards.placaRede ? (
                                                                        <Input
                                                                            value={formatBrazilianNumber(network10GbpsCost)}
                                                                            onChange={(e) => { setNetwork10GbpsCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            R$ {formatBrazilianNumber(network10GbpsCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">Sistema Operacional e Serviços (Custos)</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.sistemaOperacional ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('sistemaOperacional')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('sistemaOperacional')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('sistemaOperacional')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">Windows Server 2022 Standard</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(windowsServerCost)}
                                                                                onChange={(e) => { setWindowsServerCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(windowsServerCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">Windows 10 Pro</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(windows10ProCost)}
                                                                                onChange={(e) => { setWindows10ProCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(windows10ProCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">Ubuntu Server 22.04 LTS</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(ubuntuCost)}
                                                                                onChange={(e) => { setUbuntuCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(ubuntuCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">CentOS Stream 9</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(centosCost)}
                                                                                onChange={(e) => { setCentosCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(centosCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">Debian 12</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(debianCost)}
                                                                                onChange={(e) => { setDebianCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(debianCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-cyan-400 mb-2">Rocky Linux 9</h4>
                                                                    <div>
                                                                        <Label>Custo Mensal</Label>
                                                                        {editingCards.sistemaOperacional ? (
                                                                            <Input
                                                                                value={formatBrazilianNumber(rockyLinuxCost)}
                                                                                onChange={(e) => { setRockyLinuxCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                                className="bg-slate-800 border-slate-700"
                                                                            />
                                                                        ) : (
                                                                            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                                R$ {formatBrazilianNumber(rockyLinuxCost)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Serviços Adicionais */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">Backup (por GB)</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.backup ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('backup')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('backup')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('backup')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                {editingCards.backup ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(backupCostPerGb)}
                                                                        onChange={(e) => { setBackupCostPerGb(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(backupCostPerGb)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">IP Adicional</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.ipAdicional ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('ipAdicional')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('ipAdicional')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('ipAdicional')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                {editingCards.ipAdicional ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(additionalIpCost)}
                                                                        onChange={(e) => { setAdditionalIpCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(additionalIpCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Snapshot e VPN */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">Snapshot Adicional</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.snapshot ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('snapshot')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('snapshot')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('snapshot')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                {editingCards.snapshot ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(snapshotCost)}
                                                                        onChange={(e) => { setSnapshotCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(snapshotCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                        <CardHeader className="flex flex-row items-center justify-between">
                                                            <CardTitle className="text-cyan-400">VPN Site-to-Site</CardTitle>
                                                            <div className="flex gap-2">
                                                                {!editingCards.vpnSiteToSite ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('vpnSiteToSite')}
                                                                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => toggleCardEdit('vpnSiteToSite')}
                                                                            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => saveCard('vpnSiteToSite')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Salvar
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                {editingCards.vpnSiteToSite ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(vpnSiteToSiteCost)}
                                                                        onChange={(e) => { setVpnSiteToSiteCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(vpnSiteToSiteCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Prazos Contratuais e Descontos */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-cyan-400">Prazos Contratuais e Descontos</CardTitle>
                                                        <div className="flex gap-2">
                                                            {!editingCards.prazosContratuais ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleCardEdit('prazosContratuais')}
                                                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('prazosContratuais')}
                                                                        className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => saveCard('prazosContratuais')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <Save className="h-4 w-4 mr-1" />
                                                                        Salvar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">12 Meses</h4>
                                                                <div>
                                                                    <Label>Desconto (%)</Label>
                                                                    {editingCards.prazosContratuais ? (
                                                                        <Input
                                                                            value={contractDiscounts[12]}
                                                                            onChange={(e) => { setContractDiscounts(prev => ({ ...prev, 12: parseFloat(e.target.value.replace(",", ".")) || 0 })); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            {contractDiscounts[12]}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">24 Meses</h4>
                                                                <div>
                                                                    <Label>Desconto (%)</Label>
                                                                    {editingCards.prazosContratuais ? (
                                                                        <Input
                                                                            value={contractDiscounts[24]}
                                                                            onChange={(e) => { setContractDiscounts(prev => ({ ...prev, 24: parseFloat(e.target.value.replace(",", ".")) || 0 })); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            {contractDiscounts[24]}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">36 Meses</h4>
                                                                <div>
                                                                    <Label>Desconto (%)</Label>
                                                                    {editingCards.prazosContratuais ? (
                                                                        <Input
                                                                            value={contractDiscounts[36]}
                                                                            onChange={(e) => { setContractDiscounts(prev => ({ ...prev, 36: parseFloat(e.target.value.replace(",", ".")) || 0 })); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            {contractDiscounts[36]}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">48 Meses</h4>
                                                                <div>
                                                                    <Label>Desconto (%)</Label>
                                                                    {editingCards.prazosContratuais ? (
                                                                        <Input
                                                                            value={contractDiscounts[48]}
                                                                            onChange={(e) => { setContractDiscounts(prev => ({ ...prev, 48: parseFloat(e.target.value.replace(",", ".")) || 0 })); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            {contractDiscounts[48]}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-cyan-400 mb-2">60 Meses</h4>
                                                                <div>
                                                                    <Label>Desconto (%)</Label>
                                                                    {editingCards.prazosContratuais ? (
                                                                        <Input
                                                                            value={contractDiscounts[60]}
                                                                            onChange={(e) => { setContractDiscounts(prev => ({ ...prev, 60: parseFloat(e.target.value.replace(",", ".")) || 0 })); setHasChanged(true); }}
                                                                            className="bg-slate-800 border-slate-700"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                            {contractDiscounts[60]}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Taxa de Setup */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-cyan-400">Taxa de Setup</CardTitle>
                                                        <div className="flex gap-2">
                                                            {!editingCards.taxaSetup ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleCardEdit('taxaSetup')}
                                                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('taxaSetup')}
                                                                        className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => saveCard('taxaSetup')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <Save className="h-4 w-4 mr-1" />
                                                                        Salvar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-4">Taxa de Setup Geral</h4>
                                                            <div>
                                                                <Label>Valor Base</Label>
                                                                {editingCards.taxaSetup ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(setupFee)}
                                                                        onChange={(e) => { setSetupFee(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(setupFee)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Gestão e Suporte */}
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-cyan-400">Gestão e Suporte</CardTitle>
                                                        <div className="flex gap-2">
                                                            {!editingCards.gestaoSuporte ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleCardEdit('gestaoSuporte')}
                                                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => toggleCardEdit('gestaoSuporte')}
                                                                        className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-slate-900"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => saveCard('gestaoSuporte')}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <Save className="h-4 w-4 mr-1" />
                                                                        Salvar
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-4">Serviço Mensal de Gestão e Suporte</h4>
                                                            <div>
                                                                <Label>Valor Mensal</Label>
                                                                {editingCards.gestaoSuporte ? (
                                                                    <Input
                                                                        value={formatBrazilianNumber(managementAndSupportCost)}
                                                                        onChange={(e) => { setManagementAndSupportCost(parseFloat(e.target.value.replace(",", ".")) || 0); setHasChanged(true); }}
                                                                        className="bg-slate-800 border-slate-700"
                                                                    />
                                                                ) : (
                                                                    <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white">
                                                                        R$ {formatBrazilianNumber(managementAndSupportCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>


                                            </div>
                                        </TabsContent>

                                        <TabsContent value="proposal">
                                            <div className="space-y-6 mt-6">
                                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <FileText className="h-5 w-5" />
                                                            Resumo da Proposta
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {addedProducts.length === 0 ? (
                                                            <div className="text-center py-8 text-slate-400">
                                                                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                                <p>Nenhuma VM adicionada à proposta ainda.</p>
                                                                <p className="text-sm">Configure uma VM na aba "Calculadora VM" e clique em "Adicionar à Proposta".</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="mb-4">
                                                                    <Label htmlFor="proposal-status" className="mb-2 block">Status da Proposta</Label>
                                                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                                        <SelectTrigger id="proposal-status" className="bg-slate-800 border-slate-700 text-white">
                                                                            <SelectValue placeholder="Selecione o status" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-slate-800 text-white">
                                                                            <SelectItem value="Aguardando aprovação desconto Diretoria">Aguardando aprovação desconto Diretoria</SelectItem>
                                                                            <SelectItem value="Aguardando Aprovação do Cliente">Aguardando Aprovação do Cliente</SelectItem>
                                                                            <SelectItem value="Fechado Ganho">Fechado Ganho</SelectItem>
                                                                            <SelectItem value="Perdido">Perdido</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow className="border-slate-700">
                                                                            <TableHead className="text-white">Descrição</TableHead>
                                                                            <TableHead className="text-white">Setup</TableHead>
                                                                            <TableHead className="text-white">Mensal/VM</TableHead>
                                                                            <TableHead className="text-white">Mensal Total</TableHead>
                                                                            <TableHead className="text-white w-20">Ações</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {addedProducts.map(p => (
                                                                            <TableRow key={p.id} className="border-slate-800">
                                                                                <TableCell className="text-white">{p.description}</TableCell>
                                                                                <TableCell className="text-white">{formatCurrency(p.setup)}</TableCell>
                                                                                <TableCell className="text-white">
                                                                                    {p.details?.unitMonthly ? formatCurrency(p.details.unitMonthly) :
                                                                                        (p.details?.quantity ? formatCurrency(p.monthly / p.details.quantity) : formatCurrency(p.monthly))}
                                                                                </TableCell>
                                                                                <TableCell className="text-white">{formatCurrency(p.monthly)}</TableCell>
                                                                                <TableCell>
                                                                                    <Button
                                                                                        variant="destructive"
                                                                                        size="sm"
                                                                                        onClick={() => handleRemoveProduct(p.id)}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>

                                                                {/* Controles de Desconto */}
                                                                <div className="space-y-4 p-4 bg-slate-800 rounded-lg mt-4">
                                                                    {(currentUser?.role !== 'director' && currentUser?.role !== 'admin') && (
                                                                        <div className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id="salesperson-discount-toggle"
                                                                                checked={applySalespersonDiscount}
                                                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                                                            />
                                                                            <Label htmlFor="salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                                                        </div>
                                                                    )}
                                                                    {(currentUser?.role === 'director' || currentUser?.role === 'admin') && (
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
                                                                    {currentUser?.role === 'admin' && (
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

                                                                <div className="space-y-2 pt-4 border-t border-slate-700">
                                                                    {applySalespersonDiscount && (
                                                                        <div className="flex justify-between text-orange-400">
                                                                            <span>Desconto Vendedor (5%) - Apenas Mensal:</span>
                                                                            <span>-{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) * 0.05)}</span>
                                                                        </div>
                                                                    )}
                                                                    {appliedDirectorDiscountPercentage > 0 && (
                                                                        <div className="flex justify-between text-orange-400">
                                                                            <span>Desconto Diretor ({appliedDirectorDiscountPercentage}%) - Apenas Mensal:</span>
                                                                            <span>-{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) * (applySalespersonDiscount ? 0.95 : 1) * (appliedDirectorDiscountPercentage / 100))}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between items-center font-bold text-lg">
                                                                        <div>
                                                                            Total Setup: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0))}</span>
                                                                        </div>
                                                                        <div>
                                                                            Total Mensal: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) * (applySalespersonDiscount ? 0.95 : 1) * (1 - appliedDirectorDiscountPercentage / 100))}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-4 pt-4">
                                                                    <Button
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                        onClick={() => setActiveTab('calculator')}
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Adicionar Mais VMs
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                        Gerar Proposta
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="flex justify-end gap-4 mt-8">
                                    {hasChanged && currentProposal?.id && (
                                        <Button
                                            onClick={() => {
                                                if (currentProposal.id) {
                                                    handleSave(currentProposal.id, true);
                                                    setHasChanged(false);
                                                }
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            disabled={addedProducts.length === 0}
                                        >
                                            Salvar como Nova Versão
                                        </Button>
                                    )}
                                    <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700" disabled={addedProducts.length === 0}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Proposta
                                    </Button>
                                    <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700" disabled={addedProducts.length === 0}><Download className="h-4 w-4 mr-2" />Gerar PDF</Button>
                                    <Button variant="outline" onClick={() => setViewMode('search')}>Cancelar</Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div >

            <div id="print-area" className="print-only">
                {currentProposal && (
                    <>
                        <div className="print-header">
                            <h1>Proposta Comercial</h1>
                            <p><strong>Proposta ID:</strong> {currentProposal.id}</p>
                            <p><strong>Cliente:</strong> {clientData.name}</p>
                            <p><strong>Gerente:</strong> {accountManagerData.name}</p>
                            <p><strong>Data:</strong> {new Date(currentProposal.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <h2>Itens da Proposta</h2>
                        <table className="print-table">
                            <thead><tr><th>Descrição</th><th>Setup</th><th>Mensal</th></tr></thead>
                            <tbody>
                                {addedProducts.map(p => (
                                    <tr key={p.id}><td>{p.description}</td><td>{formatCurrency(p.setup)}</td><td>{formatCurrency(p.monthly)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="print-totals">
                            <h3>Total Geral</h3>
                            <p><strong>Total Instalação:</strong> {formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0))}</p>
                            <p><strong>Total Mensal:</strong> {formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0))}</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default MaquinasVirtuaisCalculator;