/**
 * Patch PT pillar article: replace AI-generated (Portugal-only) content
 * with manually written PT+BR content.
 */
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const ARTICLE_ID = '652f0884-ad8e-4a0d-8047-7828272cbf88'
const OID = '15957920'
const PT  = 'https://shop.doterra.com/PT/pt_PT/shop'
const BR  = 'https://doterra.me/ebe7wF'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

const title = 'Como Comprar doTERRA com Desconto'

const meta_description = 'Descubra como comprar óleos essenciais doTERRA com 25% de desconto. Guia completo dos kits de inscrição para Portugal e Brasil — sem obrigações, sem mensalidades.'

const content_markdown = `# Como Comprar doTERRA com Desconto

Se já descobriu os óleos essenciais doTERRA e quer começar a usá-los regularmente, existe uma forma muito mais inteligente de comprar do que pagar o preço de retalho: tornar-se membro e obter **25% de desconto permanente** em todas as encomendas.

Neste guia explicamos como funciona o sistema de desconto doTERRA, quais os kits de inscrição disponíveis e como fazer a sua primeira compra — seja em Portugal, no Brasil ou em qualquer outro país lusófono.

## Preço de Retalho vs. Preço de Membro

A doTERRA tem dois preços: o preço de retalho (qualquer pessoa pode comprar) e o preço de membro (25% mais barato). Para ter acesso ao preço de membro, basta escolher um kit de inscrição na sua primeira compra.

Não existe mensalidade, não há obrigação de vender nem de recrutar. A maioria das pessoas inscreve-se simplesmente para usar os produtos em casa com desconto.

## Kits de Inscrição: Por Onde Começar

Os kits de inscrição são a forma mais económica de começar — incluem os óleos mais populares, muitas vezes um difusor, e o desconto de 25% a partir daí.

O [Home Essentials Kit](${PT}/home-essentials-enrolment/?OwnerID=${OID}) é a escolha mais popular para quem quer uma coleção versátil para o dia a dia. Inclui 10 óleos essenciais fundamentais como [Lavanda](${PT}/lavender-oil/?OwnerID=${OID}), [Hortelã-Pimenta](${PT}/peppermint-oil/?OwnerID=${OID}), [Limão](${PT}/lemon-oil/?OwnerID=${OID}) e [On Guard](${PT}/onguard-oil/?OwnerID=${OID}), mais um difusor.

Para famílias, o [Family Essentials Kit](${PT}/family-essentials-enrolment/?OwnerID=${OID}) oferece uma seleção mais abrangente, pensada para apoiar o bem-estar de toda a casa — adultos e crianças.

Se o foco for bem-estar holístico e suplementação, o [Natural Solutions Kit](${PT}/natural-solutions-enrolment/?OwnerID=${OID}) combina óleos essenciais com suplementos como o [Lifelong Vitality Pack](${PT}/veo-mega/?OwnerID=${OID}), para uma abordagem mais completa.

Para quem tem filhos pequenos, o [Kids Collection Kit](${PT}/kids-collection-enrolment/?OwnerID=${OID}) inclui misturas especialmente formuladas para uso seguro com crianças.

## Vantagens de Ser Membro doTERRA

Além dos **25% de desconto imediato**, os membros têm acesso a:

- **Programa de pontos (LRP):** ao configurar uma encomenda mensal automática, acumula pontos que podem valer até 30% do valor da compra — usados depois para obter produtos gratuitos.
- **Promoções mensais exclusivas:** produtos em destaque com descontos adicionais ou bónus gratuitos.
- **Sem compromisso:** pode pausar, alterar ou cancelar encomendas quando quiser.
- **Comunidade e recursos:** acesso a guias, receitas e webinars sobre bem-estar natural.

## Como Fazer a Sua Primeira Compra

O processo é simples:

1. Escolha o kit que melhor se adapta às suas necessidades
2. Durante o checkout, selecione a opção **"Wholesale Customer"** (Cliente com Desconto)
3. Complete a inscrição — a taxa de inscrição está incluída no valor do kit
4. Receba o seu número de membro e comece a encomendar com 25% de desconto

**Está em Portugal?** Aceda à [loja doTERRA PT](${PT}/essential-oils/?OwnerID=${OID}) para ver todos os produtos com preços em euros.

**Está no Brasil?** Aceda ao [portal doTERRA Brasil](${BR}) — será redirecionado para a loja correta com os preços em reais e as opções disponíveis para o Brasil.

Tem dúvidas sobre qual kit escolher? Pode contactar-nos pelo WhatsApp: [+39 366 215 6309](https://wa.me/393662156309).

## Qual Kit é Certo para Mim?

| Perfil | Kit Recomendado |
|---|---|
| Primeira vez, quero experimentar | [Home Essentials](${PT}/home-essentials-enrolment/?OwnerID=${OID}) |
| Família com crianças | [Family Essentials](${PT}/family-essentials-enrolment/?OwnerID=${OID}) |
| Foco em bem-estar completo | [Natural Solutions](${PT}/natural-solutions-enrolment/?OwnerID=${OID}) |
| Para os mais pequenos | [Kids Collection](${PT}/kids-collection-enrolment/?OwnerID=${OID}) |
| Foco em detox | [Cleanse & Restore](${PT}/cleanse-restore-enrolment/?OwnerID=${OID}) |

## Perguntas Frequentes

**Tenho de vender produtos para manter o desconto?**
Não. O desconto é seu enquanto mantiver a conta ativa. Não há obrigação de vender, recrutar ou atingir qualquer volume mínimo.

**Posso encomendar uma única vez e manter o desconto?**
Sim. Não existe encomenda mínima mensal obrigatória. O desconto mantém-se independentemente da frequência das compras.

**O desconto de 25% aplica-se a todos os produtos?**
Sim, a praticamente toda a gama — óleos individuais, misturas, suplementos e a maioria dos acessórios.

**Como funciona o envio para o Brasil?**
O [portal Brasil](${BR}) trata do envio local com os Correios ou transportadoras parceiras e rastreamento incluído.

**Posso oferecer produtos doTERRA a alguém?**
Pode. Encomende com a sua conta de membro e envie para qualquer morada, aproveitando sempre os 25% de desconto.

**O que acontece se não gostar dos produtos?**
A doTERRA tem uma política de satisfação garantida. Se não estiver satisfeito, contacte o suporte nos primeiros 30 dias.

---

*Este site contém links de afiliado doTERRA. Como Bem-Estar Advogado doTERRA independente (#${OID}), podemos receber uma comissão quando compra através dos nossos links, sem custo adicional para si.*`

// Patch via direct REST call (bypasses PostgREST schema cache issue)
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/articles?id=eq.${ARTICLE_ID}`,
  {
    method: 'PATCH',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer':        'return=representation',
    },
    body: JSON.stringify({
      title,
      content_markdown,
      meta_description,
      status:       'published',
      published_at: new Date().toISOString(),
    }),
  }
)

if (!res.ok) {
  const err = await res.text()
  console.error('❌ PATCH failed:', res.status, err)
  process.exit(1)
}

const [updated] = await res.json()
console.log('✅ Pillar PT patchato')
console.log('   ID:    ', updated.id)
console.log('   Title: ', updated.title)
console.log('   Slug:  ', updated.slug)
console.log('   Status:', updated.status)
console.log(`\n→ URL: essentialsynergybr.com/pt/blog/${updated.slug}`)
console.log(`\nNext: node scripts/patch-pt-pillar.mjs → generate image via API`)
console.log(`  article_id: ${updated.id}`)
