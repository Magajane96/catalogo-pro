# MGD Catalogo PRO

Plataforma SaaS multiusuario para criacao de catalogos profissionais e recebimento de pedidos pelo WhatsApp.

O projeto foi pensado para pequenos empreendedores criarem uma loja independente em poucos minutos. Nao e marketplace: cada usuario tem sua propria loja, produtos, clientes, pedidos e relatorios.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, Storage e RLS
- Vercel para deploy

## Configuracao local

1. Crie um projeto no Supabase.
2. Copie `.env.example` para `.env.local`.
3. Preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` usado por metadata, robots e sitemap
4. Execute as migracoes em ordem no SQL Editor do Supabase:
   - `202606150001_initial_schema.sql`
   - `202606150002_public_checkout.sql`
   - `202606150003_admin_read_policies.sql`
   - `202606150004_order_item_variations.sql`
   - `202606150005_auto_stock_decrement.sql`
   - `202606150006_mark_whatsapp_sent.sql`
   - `202606150007_order_status_stock_restore.sql`
   - `202606150008_realtime_dashboard.sql`
   - `202606150009_order_notes.sql`
   - `202606150010_subscriptions_foundation.sql`
   - `202606150011_variant_checkout.sql`
   - `202606150012_order_variant_snapshot.sql`
   - `202606150013_security_hardening.sql`
   - `202606150014_admin_manual_pro.sql`
   - `202606150015_admin_revoke_manual_pro.sql`
5. No Supabase Auth, adicione estas URLs permitidas:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/redefinir-senha`
6. Instale e rode:

```bash
npm install
npm run dev
```

## Funcionalidades atuais

- Cadastro, login e recuperacao de senha por e-mail.
- Onboarding de primeira loja.
- Dashboard com indicadores, semana da loja, estoque baixo e atividades recentes.
- Realtime no dashboard para novos pedidos e atividades da loja.
- CRUD de produtos com imagens, galeria reordenavel, foto principal, opcoes e estoque por variante.
- CRUD de categorias.
- Clientes cadastrados automaticamente com historico de pedidos.
- Pedidos com status, itens, variacoes, SKU da variante, baixa de estoque e restauracao em cancelamento.
- Observacoes do cliente salvas no pedido e enviadas ao WhatsApp.
- Loja publica em `/loja/[slug]`.
- Pagina individual de produto.
- Carrinho e checkout via WhatsApp.
- Link da loja e QR Code para download.
- Personalizacao de logo, banner, cores, fonte e SEO.
- `robots.txt` e `sitemap.xml` dinamicos para landing, lojas publicadas e produtos ativos.
- Painel admin global para usuario com role `admin`.
- Plano Free com limite de 20 produtos.
- Estrutura PRO preparada com tabela de assinaturas, status, periodo e sincronizacao automatica do plano do perfil.

## Deploy na Vercel

1. Conecte o repositorio na Vercel.
2. Configure as variaveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` com a URL de producao
3. No Supabase Auth, adicione as URLs de callback da Vercel:
   - `https://seu-dominio.com/auth/callback`
   - `https://seu-dominio.com/auth/callback?next=/auth/redefinir-senha`
4. Confirme que as migracoes foram executadas em ordem no Supabase.
5. Rode um build local antes do deploy:

```bash
npm run lint
npm run build
```

## Checklist de producao

Antes de vender para clientes reais, confirme:

- Projeto Supabase criado em conta definitiva.
- Todas as migracoes aplicadas em ordem.
- Buckets `store-assets` e `product-images` criados pelas migracoes.
- Redirect URLs do Supabase Auth configuradas para localhost e dominio final.
- Variaveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` configuradas na Vercel.
- Dominio final usando HTTPS.
- Usuario administrador criado em `profiles.role = 'admin'`.
- Loja teste criada, publicada e com QR Code/link funcionando.
- Produto com imagem, variante, estoque e SKU cadastrado.
- Pedido teste finalizado pelo WhatsApp e aparecendo no painel.
- Cancelamento de pedido testado para confirmar restauracao de estoque.
- `npm run lint` e `npm run build` executados com sucesso.

## Storage no Supabase

As migracoes criam os buckets publicos:

- `store-assets`
- `product-images`

As politicas de Storage permitem leitura publica e escrita apenas pelo usuario autenticado dentro da propria pasta.

## Seguranca

Todas as entidades privadas usam Row Level Security. O acesso e vinculado ao `auth.uid()` do proprietario da loja. As politicas publicas permitem apenas leitura de lojas/produtos publicados e criacao controlada de visitas/pedidos.

A migracao `202606150013_security_hardening.sql` remove insercao publica direta em `orders`; pedidos publicos devem passar pela funcao `create_public_order`, que valida cliente, itens, estoque e total. Ela tambem adiciona indices operacionais, limite de imagem principal por produto e constraints de integridade para cores, telefones, preco promocional e metadados.

## Admin global

O painel `/dashboard/admin` fica disponivel apenas para perfis com `role = 'admin'` na tabela `profiles`.

Para promover um usuario no Supabase:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID_DO_USUARIO';
```

## Assinaturas futuras

A migracao `202606150010_subscriptions_foundation.sql` cria a tabela `subscriptions` para receber dados de um provedor de pagamento no futuro.

Status considerados PRO automaticamente:

- `trialing`
- `active`

Quando uma assinatura PRO ativa e inserida, atualizada ou removida, o banco sincroniza `profiles.plan` para `pro` ou `free`. A integracao com Stripe, Mercado Pago ou outro provedor deve escrever nessa tabela usando ambiente seguro de servidor ou webhook com service role.

Admins tambem podem liberar, renovar ou revogar PRO manualmente pelo painel global. As acoes usam as funcoes seguras `admin_grant_manual_pro` e `admin_revoke_manual_pro`, que validam `role = 'admin'` antes de alterar uma assinatura manual.

## Checklist antes de vender

- Criar projeto Supabase real.
- Rodar todas as migracoes em ordem.
- Confirmar redirects do Supabase Auth.
- Configurar buckets e politicas via migracao.
- Configurar variaveis na Vercel.
- Criar usuario admin.
- Testar cadastro, login, recuperacao de senha, criacao de loja, produto, pedido e envio para WhatsApp.
