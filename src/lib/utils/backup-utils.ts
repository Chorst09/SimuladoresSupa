/**
 * Utilitários para backup e restore de configurações das calculadoras
 */

import { exportData, downloadFile } from './export-utils';
import { importFromFile, ImportResult } from './import-utils';

export interface BackupData {
  version: string;
  timestamp: string;
  calculatorType: string;
  configurations: any;
  proposals?: any[];
  metadata: {
    appVersion: string;
    userAgent: string;
    exportedBy?: string;
  };
}

export interface BackupOptions {
  includeProposals?: boolean;
  includeMetadata?: boolean;
  compress?: boolean;
}

export interface RestoreResult {
  success: boolean;
  data?: BackupData;
  errors: string[];
  warnings: string[];
}

/**
 * Cria backup completo das configurações
 */
export const createBackup = (
  calculatorType: string,
  configurations: any,
  proposals: any[] = [],
  options: BackupOptions = {}
): BackupData => {
  const {
    includeProposals = true,
    includeMetadata = true
  } = options;

  const backup: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    calculatorType,
    configurations,
    metadata: {
      appVersion: '1.0.0',
      userAgent: navigator.userAgent
    }
  };

  if (includeProposals && proposals.length > 0) {
    backup.proposals = proposals;
  }

  if (includeMetadata) {
    backup.metadata.exportedBy = 'Sistema de Calculadoras';
  }

  return backup;
};

/**
 * Salva backup em arquivo
 */
export const saveBackup = (
  backup: BackupData,
  filename?: string
): void => {
  const defaultFilename = `backup-${backup.calculatorType}-${new Date().toISOString().split('T')[0]}`;
  const finalFilename = filename || defaultFilename;
  
  const content = JSON.stringify(backup, null, 2);
  downloadFile(content, `${finalFilename}.json`, 'application/json');
};

/**
 * Cria e salva backup automaticamente
 */
export const autoBackup = (
  calculatorType: string,
  configurations: any,
  proposals: any[] = [],
  options: BackupOptions = {}
): void => {
  const backup = createBackup(calculatorType, configurations, proposals, options);
  saveBackup(backup);
};

/**
 * Restaura backup de arquivo
 */
export const restoreFromFile = async (file: File): Promise<RestoreResult> => {
  const result: RestoreResult = {
    success: false,
    errors: [],
    warnings: []
  };

  try {
    const importResult = await importFromFile(file, {
      allowedFormats: ['json'],
      validateData: true
    });

    if (!importResult.success) {
      result.errors = importResult.errors;
      return result;
    }

    if (importResult.data.length === 0) {
      result.errors.push('Arquivo de backup vazio');
      return result;
    }

    const backupData = importResult.data[0] as BackupData;

    // Validação do backup
    const validation = validateBackup(backupData);
    if (!validation.isValid) {
      result.errors = validation.errors;
      return result;
    }

    // Verificações de compatibilidade
    const compatibility = checkCompatibility(backupData);
    if (compatibility.warnings.length > 0) {
      result.warnings = compatibility.warnings;
    }

    result.success = true;
    result.data = backupData;
    return result;

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
    return result;
  }
};

/**
 * Valida estrutura do backup
 */
const validateBackup = (backup: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!backup.version) {
    errors.push('Versão do backup não encontrada');
  }

  if (!backup.timestamp) {
    errors.push('Timestamp do backup não encontrado');
  }

  if (!backup.calculatorType) {
    errors.push('Tipo de calculadora não especificado');
  }

  if (!backup.configurations) {
    errors.push('Configurações não encontradas no backup');
  }

  if (!backup.metadata) {
    errors.push('Metadados do backup não encontrados');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Verifica compatibilidade do backup
 */
const checkCompatibility = (backup: BackupData): { isCompatible: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Verifica versão do backup
  if (backup.version !== '1.0') {
    warnings.push(`Versão do backup (${backup.version}) pode não ser totalmente compatível`);
  }

  // Verifica idade do backup
  const backupDate = new Date(backup.timestamp);
  const daysDiff = Math.floor((Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 90) {
    warnings.push(`Backup tem ${daysDiff} dias. Pode conter configurações desatualizadas`);
  }

  // Verifica se há propostas no backup
  if (backup.proposals && backup.proposals.length > 0) {
    warnings.push(`Backup contém ${backup.proposals.length} propostas que serão restauradas`);
  }

  return {
    isCompatible: true,
    warnings
  };
};

/**
 * Aplica configurações do backup
 */
export const applyBackupConfigurations = (
  backup: BackupData,
  currentConfigurations: any
): any => {
  // Merge das configurações, priorizando o backup mas mantendo configurações críticas atuais
  const merged = {
    ...currentConfigurations,
    ...backup.configurations
  };

  // Preserva configurações críticas que não devem ser sobrescritas
  const preservedKeys = ['userId', 'sessionId', 'lastLogin'];
  preservedKeys.forEach(key => {
    if (currentConfigurations[key]) {
      merged[key] = currentConfigurations[key];
    }
  });

  return merged;
};

/**
 * Cria backup incremental (apenas mudanças)
 */
export const createIncrementalBackup = (
  calculatorType: string,
  currentConfigurations: any,
  lastBackup?: BackupData
): BackupData | null => {
  if (!lastBackup) {
    return createBackup(calculatorType, currentConfigurations);
  }

  // Compara configurações para identificar mudanças
  const changes = findConfigurationChanges(lastBackup.configurations, currentConfigurations);
  
  if (Object.keys(changes).length === 0) {
    return null; // Nenhuma mudança
  }

  return createBackup(calculatorType, changes);
};

/**
 * Encontra mudanças entre configurações
 */
const findConfigurationChanges = (oldConfig: any, newConfig: any): any => {
  const changes: any = {};

  Object.keys(newConfig).forEach(key => {
    if (JSON.stringify(oldConfig[key]) !== JSON.stringify(newConfig[key])) {
      changes[key] = newConfig[key];
    }
  });

  return changes;
};

/**
 * Agenda backup automático
 */
export const scheduleAutoBackup = (
  calculatorType: string,
  getConfigurations: () => any,
  getProposals: () => any[],
  intervalMinutes: number = 60
): number => {
  return window.setInterval(() => {
    try {
      const configurations = getConfigurations();
      const proposals = getProposals();
      
      autoBackup(calculatorType, configurations, proposals, {
        includeProposals: true,
        includeMetadata: true
      });
      
      console.log(`Backup automático criado para ${calculatorType}`);
    } catch (error) {
      console.error('Erro no backup automático:', error);
    }
  }, intervalMinutes * 60 * 1000);
};

/**
 * Cancela backup automático
 */
export const cancelAutoBackup = (intervalId: number): void => {
  clearInterval(intervalId);
};

/**
 * Exporta histórico de backups
 */
export const exportBackupHistory = (backups: BackupData[]): void => {
  const historyData = backups.map(backup => ({
    'Tipo': backup.calculatorType,
    'Data': new Date(backup.timestamp).toLocaleString('pt-BR'),
    'Versão': backup.version,
    'Propostas': backup.proposals?.length || 0,
    'Tamanho (KB)': Math.round(JSON.stringify(backup).length / 1024)
  }));

  exportData(historyData, {
    filename: 'historico-backups',
    format: 'csv'
  });
};

/**
 * Limpa backups antigos
 */
export const cleanOldBackups = (
  backups: BackupData[],
  maxAge: number = 30 // dias
): BackupData[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  return backups.filter(backup => {
    const backupDate = new Date(backup.timestamp);
    return backupDate >= cutoffDate;
  });
};

/**
 * Comprime backup (simulação - em produção usaria biblioteca de compressão)
 */
export const compressBackup = (backup: BackupData): string => {
  // Em uma implementação real, usaria uma biblioteca como pako ou similar
  // Por enquanto, apenas remove espaços desnecessários
  return JSON.stringify(backup);
};

/**
 * Descomprime backup
 */
export const decompressBackup = (compressedData: string): BackupData => {
  // Em uma implementação real, faria a descompressão adequada
  return JSON.parse(compressedData);
};