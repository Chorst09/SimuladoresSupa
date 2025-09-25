-- Script de Diagnóstico para Tabelas de Comissão
-- Execute este script no SQL Editor do Supabase para diagnosticar problemas

-- 1. Verificar se as tabelas existem e têm dados
SELECT 'commission_channel_seller' as table_name, COUNT(*) as record_count FROM commission_channel_seller
UNION ALL
SELECT 'commission_channel_director' as table_name, COUNT(*) as record_count FROM commission_channel_director
UNION ALL
SELECT 'commission_seller' as table_name, COUNT(*) as record_count FROM commission_seller
UNION ALL
SELECT 'commission_channel_influencer' as table_name, COUNT(*) as record_count FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as table_name, COUNT(*) as record_count FROM commission_channel_indicator;

-- 2. Verificar se RLS está ativo
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'commission_%'
ORDER BY tablename;

-- 3. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename LIKE 'commission_%'
ORDER BY tablename, policyname;

-- 4. Verificar se a função get_user_role existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_user_role';

-- 5. Verificar tabela user_profiles
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- 6. Verificar usuário atual (se logado)
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 7. Testar função get_user_role
SELECT get_user_role() as current_user_role;

-- 8. Ver dados de exemplo das tabelas (sem RLS)
SELECT 'channel_seller_data' as info, id, months_12, months_24 FROM commission_channel_seller LIMIT 2;
SELECT 'channel_influencer_data' as info, id, revenue_range, months_12 FROM commission_channel_influencer LIMIT 2;

-- 9. Verificar se há erros de permissão
-- Temporariamente desabilitar RLS para teste (CUIDADO: apenas para debug)
-- ALTER TABLE commission_channel_seller DISABLE ROW LEVEL SECURITY;
-- SELECT * FROM commission_channel_seller LIMIT 1;
-- ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
