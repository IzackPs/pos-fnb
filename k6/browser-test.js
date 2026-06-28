import { browser } from "k6/browser";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// ─── Métricas customizadas ────────────────────────────────────────────────────
const loginDuration      = new Trend("browser_login_duration", true);
const orderFlowDuration  = new Trend("browser_order_flow_duration", true);
const checkoutDuration   = new Trend("browser_checkout_duration", true);
const flowErrors         = new Rate("browser_flow_errors");

// ─── Configuração ─────────────────────────────────────────────────────────────
const BASE     = __ENV.BASE_URL     || "http://localhost:3000";
const USERNAME = __ENV.LOAD_TEST_USER || "admin";
const PASSWORD = __ENV.LOAD_TEST_PASS || "admin123";

// Perfil CI: 1 VU por 90s (tempo total incluindo warmup do browser).
// Perfil local/staging: 2 VUs concorrentes por 3 minutos.
const isCiProfile = __ENV.LOAD_TEST_PROFILE === "ci";

export const options = {
  scenarios: {
    pos_order_flow: {
      executor: "constant-vus",
      vus: isCiProfile ? 1 : 2,
      duration: isCiProfile ? "90s" : "3m",
      options: {
        browser: {
          type: "chromium",
          // Headless no CI, headful localmente para debug
          headless: __ENV.BROWSER_HEADLESS !== "false",
        },
      },
    },
  },
  thresholds: {
    // Login deve completar em <5s (inclui hidratação do React)
    browser_login_duration:     ["p(95)<5000"],
    // Fluxo de pedido (abrir mesa → adicionar item → enviar cozinha) em <8s
    browser_order_flow_duration: ["p(95)<8000"],
    // Checkout (abrir dialog → confirmar pagamento) em <5s
    browser_checkout_duration:  ["p(95)<5000"],
    // Taxa de erro do fluxo completo
    browser_flow_errors:        ["rate<0.05"],
    // Core Web Vitals — LCP e INP medidos pelo k6/browser automaticamente
    "browser_web_vital_lcp{scenario:pos_order_flow}": ["p(90)<3000"],
    "browser_web_vital_inp{scenario:pos_order_flow}": ["p(90)<200"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Faz login via formulário real. Retorna quando o dashboard estiver visível.
 * @returns {number} duração em ms
 */
async function doLogin(page) {
  const t0 = Date.now();

  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");

  // Preenche credenciais
  await page.locator("input[name='username'], input[type='text']").first().fill(USERNAME);
  await page.locator("input[name='password'], input[type='password']").first().fill(PASSWORD);
  await page.locator("button[type='submit']").click();

  // Aguarda navegação para o dashboard após login bem-sucedido
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");

  return Date.now() - t0;
}

/**
 * Fluxo de pedido: abrir /order → clicar mesa livre → adicionar produto → enviar para cozinha.
 * @returns {{ duration: number, orderId: string | null }}
 */
async function doOrderFlow(page) {
  const t0 = Date.now();

  // Navegar para a tela de pedidos
  await page.goto(`${BASE}/order`);
  await page.waitForLoadState("networkidle");

  // Clicar em uma mesa livre (sem pedido aberto)
  const freeTable = page.locator("[data-testid='table-free']").first();
  const hasFreeTable = await freeTable.isVisible({ timeout: 5000 }).catch(() => false);

  if (!hasFreeTable) {
    // Se não há mesa livre, abrir uma ocupada (continuar pedido existente)
    const occupiedTable = page.locator("[data-testid='table-occupied']").first();
    await occupiedTable.click();
  } else {
    await freeTable.click();
  }

  // Aguardar o painel de produtos carregar (indica que a Server Action openTable completou)
  await page.locator("[data-testid='product-btn']").first().waitFor({ timeout: 8000 });

  // Adicionar o primeiro produto disponível
  await page.locator("[data-testid='product-btn']").first().click();

  // Aguardar um momento para topping dialog aparecer, se houver
  await sleep(0.5);

  // Se abriu dialog de topping, confirmar sem selecionar nenhum
  const toppingConfirm = page.locator("button:has-text('Adicionar'), button:has-text('Add'), button:has-text('Thêm')");
  if (await toppingConfirm.isVisible({ timeout: 1000 }).catch(() => false)) {
    await toppingConfirm.click();
  }

  // Clicar em "Enviar para Cozinha" — Server Action: sendOrder()
  const sendBtn = page.locator("[data-testid='btn-send-kitchen']");
  await sendBtn.waitFor({ timeout: 5000 });

  const sendEnabled = !(await sendBtn.isDisabled().catch(() => true));
  if (sendEnabled) {
    await sendBtn.click();
    // Aguarda feedback de sucesso (toast ou atualização do botão)
    await sleep(1);
  }

  return { duration: Date.now() - t0 };
}

/**
 * Checkout: clicar em "Fechar Conta" → preencher pagamento → confirmar.
 * @returns {number} duração em ms
 */
async function doCheckout(page) {
  const t0 = Date.now();

  // Abrir dialog de checkout — Server Action: checkoutOrder()
  const checkoutBtn = page.locator("[data-testid='btn-checkout']");
  await checkoutBtn.waitFor({ timeout: 5000 });
  await checkoutBtn.click();

  // Aguardar o dialog abrir
  const amountInput = page.locator("[data-testid='checkout-amount']");
  await amountInput.waitFor({ timeout: 5000 });

  // Preencher valor (limpar e digitar o total já preenchido pelo componente, ou digitar manualmente)
  await amountInput.click({ clickCount: 3 });
  await amountInput.type("100000");

  // Garantir método de pagamento em CASH
  const methodSelect = page.locator("[data-testid='checkout-payment-method']");
  if (await methodSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
    await methodSelect.selectOption("CASH");
  }

  // Confirmar checkout
  const confirmBtn = page.locator("[data-testid='btn-confirm-checkout']");
  await confirmBtn.waitFor({ timeout: 5000 });
  await confirmBtn.click();

  // Aguardar retorno à tela de mesas (indica que o checkout completou)
  await page.waitForSelector("[data-testid='table-free'], [data-testid='table-occupied']", { timeout: 10000 });

  return Date.now() - t0;
}

// ─── Cenário principal ────────────────────────────────────────────────────────

export default async function posOrderScenario() {
  const page = await browser.newPage();

  // Viewport padrão de tablet/desktop — o componente renderiza modo tablet nesse tamanho
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // 1. Login
    const loginMs = await doLogin(page);
    loginDuration.add(loginMs);

    const loginOk = check(page, {
      "login: chegou no dashboard": () => page.url().includes("/dashboard"),
    });
    flowErrors.add(!loginOk);
    if (!loginOk) return;

    // 2. Fluxo de pedido (abrir mesa + produto + enviar cozinha)
    const { duration: orderMs } = await doOrderFlow(page);
    orderFlowDuration.add(orderMs);

    const orderOk = check(page, {
      "order flow: tela de pedido visível": () => page.url().includes("/order"),
    });
    flowErrors.add(!orderOk);
    if (!orderOk) return;

    // 3. Checkout
    const checkoutMs = await doCheckout(page);
    checkoutDuration.add(checkoutMs);

    const checkoutOk = check(page, {
      "checkout: voltou para a grade de mesas": () => page.url().includes("/order"),
    });
    flowErrors.add(!checkoutOk);

    // Pausa entre iterações do VU (simula tempo de uso real)
    sleep(isCiProfile ? 2 : 5);

  } catch (err) {
    console.error(`[VU ${__VU}] Erro no fluxo: ${err.message}`);
    flowErrors.add(1);
  } finally {
    await page.close();
  }
}
