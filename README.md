# MGD Catalogo PRO

Plataforma SaaS multiusuario para criacao de catalogos e recebimento de pedidos pelo WhatsApp.

## Configuracao

1. Crie um projeto no Supabase.
2. Execute, em ordem, todos os arquivos de `supabase/migrations` no SQL Editor.
3. Copie `.env.example` para `.env.local` e informe URL e chave anonima.
4. No Supabase Auth, adicione `http://localhost:3000/auth/callback` nas URLs permitidas.
5. Execute `npm install` e `npm run dev`.

## Deploy

O projeto esta preparado para Vercel. Configure as mesmas variaveis de ambiente no painel da Vercel e adicione a URL de producao aos redirects do Supabase Auth.

## Seguranca

Todas as entidades privadas usam Row Level Security. O acesso e vinculado ao `auth.uid()` do proprietario da loja. As politicas publicas permitem apenas leitura de lojas e produtos publicados e criacao controlada de visitas/pedidos.
