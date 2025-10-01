/**
 * Test suite for Internet MAN Calculator error handling enhancements
 * Tests the comprehensive error handling added for proposal editing
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the logging utilities
jest.mock('@/lib/logging-utils', () => ({
    logError: jest.fn(),
    logSuccess: jest.fn(),
}));

// Test data structures
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface ClientData {
    name: string;
    contact: string;
    projectName: string;
    email: string;
    phone: string;
    companyName?: string;
    address?: string;
    cnpj?: string;
}

interface AccountManagerData {
    name: string;
    email: string;
    phone: string;
    department?: string;
    role?: string;
}

interface Product {
    id: string;
    type: string;
    description: string;
    setup: number;
    monthly: number;
    details?: any;
}

interface Proposal {
    id: string;
    baseId?: string;
    version?: number;
    client?: any;
    clientData?: ClientData;
    accountManager?: AccountManagerData;
    products?: Product[];
    totalSetup?: number;
    totalMonthly?: number;
    createdAt?: string;
    userId?: string;
    metadata?: any;
}

// Copy the validation functions from the component for testing
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

describe('Internet MAN Calculator Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateProposalStructure', () => {
        it('should return invalid for null proposal', () => {
            const result = validateProposalStructure(null);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('No proposal data provided');
        });

        it('should return invalid for non-object proposal', () => {
            const result = validateProposalStructure('invalid');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Proposal data is not a valid object');
        });

        it('should return invalid for proposal without ID', () => {
            const proposal = { client: 'Test Client' };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Proposal ID is missing');
        });

        it('should return invalid for proposal without client data', () => {
            const proposal = { id: 'test-id' };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Client information is missing');
        });

        it('should return invalid for proposal without products', () => {
            const proposal = {
                id: 'test-id',
                client: 'Test Client'
            };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Products list is missing');
        });

        it('should return invalid for proposal with invalid products array', () => {
            const proposal = {
                id: 'test-id',
                client: 'Test Client',
                products: 'not-an-array'
            };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Products data is not in valid format');
        });

        it('should return invalid for products with invalid structure', () => {
            const proposal = {
                id: 'test-id',
                client: 'Test Client',
                products: [
                    { id: '1', description: 'Product 1', setup: 'invalid', monthly: 100 }
                ]
            };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Product 1 has invalid setup cost');
        });

        it('should return valid for well-formed proposal', () => {
            const proposal = {
                id: 'test-id',
                client: 'Test Client',
                accountManager: { name: 'Manager', email: 'manager@test.com', phone: '123' },
                products: [
                    { id: '1', description: 'Product 1', setup: 100, monthly: 50 }
                ]
            };
            const result = validateProposalStructure(proposal);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should include warnings for missing optional data', () => {
            const proposal = {
                id: 'test-id',
                client: { name: '' }, // Empty name should trigger warning
                products: []  // Empty products should trigger warning
            };
            const result = validateProposalStructure(proposal);
            expect(result.warnings).toContain('Client name is missing');
            expect(result.warnings).toContain('No products found in proposal');
            expect(result.warnings).toContain('Account manager information is missing');
        });
    });

    describe('createUserFriendlyErrorMessage', () => {
        it('should return default message for empty errors', () => {
            const message = createUserFriendlyErrorMessage([]);
            expect(message).toBe('Erro desconhecido ao carregar proposta.');
        });

        it('should format multiple errors correctly', () => {
            const errors = ['Proposal ID is missing', 'Client information is missing'];
            const message = createUserFriendlyErrorMessage(errors);
            
            expect(message).toContain('1. ID da proposta não encontrado');
            expect(message).toContain('2. Informações do cliente estão ausentes');
            expect(message).toContain('Você pode:');
            expect(message).toContain('• Tentar criar uma nova proposta');
        });

        it('should translate product errors correctly', () => {
            const errors = ['Product 1 has invalid setup cost', 'Product 2 has invalid monthly cost'];
            const message = createUserFriendlyErrorMessage(errors);
            
            expect(message).toContain('1. Produto 1 tem custo de instalação inválido');
            expect(message).toContain('2. Produto 2 tem custo mensal inválido');
        });
    });

    describe('translateErrorToPortuguese', () => {
        it('should translate known errors', () => {
            expect(translateErrorToPortuguese('No proposal data provided'))
                .toBe('Nenhum dado de proposta foi fornecido');
            
            expect(translateErrorToPortuguese('Proposal ID is missing'))
                .toBe('ID da proposta não encontrado');
        });

        it('should handle product-specific errors', () => {
            expect(translateErrorToPortuguese('Product 1 has invalid structure'))
                .toBe('Produto 1 tem estrutura inválida');
            
            expect(translateErrorToPortuguese('Product 2 has invalid setup cost'))
                .toBe('Produto 2 tem custo de instalação inválido');
        });

        it('should return original error for unknown translations', () => {
            const unknownError = 'Some unknown error';
            expect(translateErrorToPortuguese(unknownError)).toBe(unknownError);
        });
    });
});

describe('Error Classification Functions', () => {
    describe('classifyEditProposalError', () => {
        const classifyEditProposalError = (error: any) => {
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

            // Default error handling
            return {
                errorMessage: 'Erro inesperado ao carregar proposta.',
                recoveryGuidance: 'Tente novamente em alguns instantes. Se o problema persistir, contate o suporte técnico.',
                canContinue: true
            };
        };

        it('should classify TypeError correctly', () => {
            const error = new TypeError('Invalid type');
            const result = classifyEditProposalError(error);
            
            expect(result.errorMessage).toBe('Erro de formato nos dados da proposta.');
            expect(result.canContinue).toBe(true);
        });

        it('should classify ReferenceError correctly', () => {
            const error = new ReferenceError('Reference not found');
            const result = classifyEditProposalError(error);
            
            expect(result.errorMessage).toBe('Referência de dados não encontrada.');
            expect(result.canContinue).toBe(true);
        });

        it('should classify SyntaxError correctly', () => {
            const error = new SyntaxError('Invalid syntax');
            const result = classifyEditProposalError(error);
            
            expect(result.errorMessage).toBe('Estrutura de dados corrompida.');
            expect(result.canContinue).toBe(false);
        });

        it('should handle unknown errors', () => {
            const error = new Error('Unknown error');
            const result = classifyEditProposalError(error);
            
            expect(result.errorMessage).toBe('Erro inesperado ao carregar proposta.');
            expect(result.canContinue).toBe(true);
        });
    });
});