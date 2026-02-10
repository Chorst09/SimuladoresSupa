# ✅ Checklist de Verificação - Correção de Comissões

## Pré-Deploy

- [ ] Código compilou sem erros
- [ ] Sem erros de TypeScript
- [ ] Sem erros de linting
- [ ] Docker image construída com `--platform linux/amd64`
- [ ] Arquivo `simuladores-app-latest.tar` criado (464 MB)
- [ ] Documentação revisada

## Deploy

- [ ] Transferência do arquivo para servidor concluída
- [ ] Containers antigos parados: `docker-compose down`
- [ ] Nova image carregada: `docker load -i /tmp/simuladores-app-latest.tar`
- [ ] Containers iniciados: `docker-compose up -d`
- [ ] Aguardado 10 segundos
- [ ] Status verificado: `docker-compose ps`
- [ ] Health check respondendo: `curl http://localhost:3009/api/health`

## Pós-Deploy - Testes Funcionais

### Teste 1: Cliente Novo
- [ ] Acessar calculadora (ex: Internet Fibra)
- [ ] NÃO marcar "Já é cliente da Base?"
- [ ] Selecionar velocidade e prazo
- [ ] Verificar se comissões aparecem no DRE
- [ ] Comissões devem ser calculadas sobre valor mensal total

### Teste 2: Cliente Existente com Aumento
- [ ] Acessar calculadora
- [ ] Marcar "Já é cliente da Base?"
- [ ] Inserir Mensalidade Anterior: R$ 9.800,00
- [ ] Selecionar velocidade que resulte em R$ 11.362,80
- [ ] Verificar "Diferença de Valor": +R$ 1.562,80
- [ ] Verificar DRE:
  - [ ] Comissão Vendedor calculada sobre R$ 1.562,80
  - [ ] Comissão Parceiro Indicador calculada sobre R$ 1.562,80
  - [ ] Comissão Parceiro Influenciador calculada sobre R$ 1.562,80

### Teste 3: Cliente Existente com Redução
- [ ] Acessar calculadora
- [ ] Marcar "Já é cliente da Base?"
- [ ] Inserir Mensalidade Anterior: R$ 11.362,80
- [ ] Selecionar velocidade que resulte em R$ 9.800,00
- [ ] Verificar "Diferença de Valor": -R$ 1.562,80
- [ ] Verificar DRE:
  - [ ] Comissão Vendedor = R$ 0,00
  - [ ] Comissão Parceiro Indicador = R$ 0,00
  - [ ] Comissão Parceiro Influenciador = R$ 0,00

### Teste 4: Calculadoras Específicas
- [ ] InternetFibraCalculator
- [ ] InternetRadioCalculator (verificar se checkbox não está duplicado)
- [ ] InternetManCalculator
- [ ] InternetManRadioCalculator
- [ ] DoubleFibraRadioCalculator
- [ ] InternetOKv2Calculator

### Teste 5: Funcionalidades Gerais
- [ ] Login funciona
- [ ] Criar proposta funciona
- [ ] Salvar proposta funciona
- [ ] Editar proposta funciona
- [ ] Exportar proposta funciona
- [ ] Sem erros no console do navegador

## Verificações de Performance

- [ ] Aplicação responde em < 2 segundos
- [ ] Cálculos de DRE executam em < 1 segundo
- [ ] Sem memory leaks (verificar com DevTools)
- [ ] Sem erros de rede (verificar Network tab)

## Verificações de Segurança

- [ ] Autenticação funciona
- [ ] Autorização funciona
- [ ] Sem dados sensíveis expostos
- [ ] HTTPS funciona (se aplicável)

## Rollback (Se Necessário)

Se algo der errado:

```bash
# 1. Parar containers
docker-compose -f /root/docker-compose.prod.yml down

# 2. Reverter para versão anterior
docker tag simuladores-app:prod simuladores-app:latest

# 3. Iniciar containers
docker-compose -f /root/docker-compose.prod.yml up -d

# 4. Verificar
docker-compose -f /root/docker-compose.prod.yml ps
curl -s http://localhost:3009/api/health
```

- [ ] Rollback testado (se necessário)
- [ ] Aplicação restaurada com sucesso

## Documentação

- [ ] Mudanças documentadas
- [ ] Usuários notificados
- [ ] Changelog atualizado
- [ ] Documentação técnica atualizada

## Sign-Off

- [ ] Desenvolvedor: _________________ Data: _______
- [ ] QA: _________________ Data: _______
- [ ] Gerente: _________________ Data: _______

---

**Notas Adicionais:**

_Espaço para anotações durante o deploy_

```
[Adicione aqui qualquer observação importante]
```

---

**Data de Conclusão**: _______________
**Status Final**: ✅ SUCESSO / ❌ FALHA

Se FALHA, descrever o problema:
```
[Descrever problema aqui]
```
