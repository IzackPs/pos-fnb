import { browser } from "k6/browser";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// ─── Métricas customizadas ────────────────────────────────────────────────────
const loginDuration      = new Trend("browser_login_duration", true);
const orderFlowDuration  = new Trend("browser_order_flow_duration", true);
const checkoutDuration   = new Trend("browser_checkout_duration", true);
const flowErrors         = new Rate("browser_flow_errors");

// ─── Configuração ─────────────────────────────────────────────────────────────
const BASE     = __ENV.BASE_URL       || "http://localhost:3000";
const USERNAME = __ENV.LOAD_TEST_USER || "admin";
const PASSWORD = __ENV.LOAD_TEST_PASS || "admin123";

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
          headless: __ENV.BROWSER_HEADLESS !== "false",
        },
      },
    },
  },
  thresholds: {
    // Login deve completar em <8s (inclui bcrypt + hidratação React)
    browser_login_duration:      ["p(95)<8000"],
    // Fluxo de pedido (abrir mesa → adicionar item → enviar cozinha) em <10s
    browser_order_flow_duration: ["p(95)<10000"],
    // Checkout em <6s
    browser_checkout_duration:   ["p(95)<6000"],
    // Taxa de erro do fluxo completo < 5%
    browser_flow_errors:         ["rate<0.05"],
    // Core Web Vitals
    "browser_web_vital_lcp{scenario:pos_order_flow}": ["p(90)<3000"],
  },
};

// ─── Helper: log de erro legível ─────────────────────────────────────────────
function errStr(err) {
  if (!err) return "unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  try { return String(err); } catch { return "unserializable error"; }
}

// ─── Helper: aguarda URL conter um padrão (poll) ──────────────────────────────
async function waitForUrlContains(page, pattern, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const url = page.url();
    if (url.includes(pattern)) return true;
    await sleep(0.3);
  }
  throw new Error(`Timeout esperando URL conter "${pattern}". URL atual: ${page.url()}`);
}

// ─── Login ────────────────────────────────────────────────────────────────────
// O login.tsx usa signIn("credentials", { redirect: false }) e depois
// faz globalThis.location.href = "/order" — não navega para /dashboard.
async function doLogin(page) {
  const t0 = Date.now();

  await page.goto(`${BASE}/login`);
  // Aguarda o formulário renderizar (o campo username já tem name="username")
  await page.locator("input[name='username']").waitFor({ timeout: 8000 });

  await page.locator("input[name='username']").fill(USERNAME);
  await page.locator("input[name='password']").fill(PASSWORD);
  await page.locator("button[type='submit']").click();

  // Após login bem-sucedido → location.href = "/order"
  await waitForUrlContains(page, "/order", 12000);
  // Aguarda o painel de mesas carregar (indica SSR + hidratação concluída)
  await page.locator("[data-testid='table-free'], [data-testid='table-occupied']").first().waitFor({ timeout: 10000 });

  return Date.now() - t0;
}

// ─── Fluxo de pedido ─────────────────────────────────────────────────────────
async function doOrderFlow(page) {
  const t0 = Date.now();

  // Tentar clicar em uma mesa livre primeiro; se não houver, usar uma ocupada
  const freeTable = page.locator("[data-testid='table-free']").first();
  const occupiedTable = page.locator("[data-testid='table-occupied']").first();

  const hasFree = await freeTable.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasFree) {
    await freeTable.click();
  } else {
    // Se não há mesa livre, usa mesa ocupada (continua pedido existente)
    const hasOccupied = await occupiedTable.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasOccupied) {
      throw new Error("Nenhuma mesa disponível (nem livre nem ocupada)");
    }
    await occupiedTable.click();
  }

  // Aguarda painel de produtos — Server Action openTable() completou quando isso aparecer
  await page.locator("[data-testid='product-btn']").first().waitFor({ timeout: 10000 });

  // Clicar no primeiro produto disponível
  await page.locator("[data-testid='product-btn']").first().click();

  // Se aparecer dialog de toppings, fechar clicando fora ou no botão de confirmar
  await sleep(0.8);
  const toppingDialog = page.locator("button[data-testid='btn-send-kitchen']");
  // Se o botão enviar ficou visível sem o dialog de topping travar, segue em frente.
  // Caso contrário, tenta fechar o dialog de topping pressionando Escape.
  const sendVisible = await toppingDialog.isVisible({ timeout: 2000 }).catch(() => false);
  if (!sendVisible) {
    // Dialog de topping aberto — confirmar com o botão de adicionar
    const addBtn = page.locator("button:enabled").filter({ hasText: /adicionar|add|thêm/i }).last();
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await page.locator("[data-testid='btn-send-kitchen']").waitFor({ timeout: 5000 });
  }

  // Enviar para cozinha — Server Action: sendOrder()
  const sendBtn = page.locator("[data-testid='btn-send-kitchen']");
  const isDisabled = await sendBtn.isDisabled().catch(() => true);
  if (!isDisabled) {
    await sendBtn.click();
    // Aguarda o botão ser processado (fica disabled momentaneamente durante o useTransition)
    await sleep(1.5);
  }
  // Se já estava disabled (itens já enviados), continua para o checkout

  return Date.now() - t0;
}

// ─── Checkout ────────────────────────────────────────────────────────────────
async function doCheckout(page) {
  const t0 = Date.now();

  // Clicar em "Fechar Conta"
  const checkoutBtn = page.locator("[data-testid='btn-checkout']");
  await checkoutBtn.waitFor({ timeout: 5000 });
  await checkoutBtn.click();

  // Aguardar o dialog de checkout abrir
  const amountInput = page.locator("[data-testid='checkout-amount']");
  await amountInput.waitFor({ timeout: 6000 });

  // Limpar e preencher o valor (triple-click seleciona tudo)
  await amountInput.click({ clickCount: 3 });
  await amountInput.pressSequentially("100000");

  // Confirmar
  const confirmBtn = page.locator("[data-testid='btn-confirm-checkout']");
  await confirmBtn.waitFor({ timeout: 3000 });
  await confirmBtn.click();

  // Aguardar retorno para a grade de mesas
  await page.locator("[data-testid='table-free'], [data-testid='table-occupied']").first().waitFor({ timeout: 10000 });

  return Date.now() - t0;
}

// ─── Cenário principal ────────────────────────────────────────────────────────
export default async function posOrderScenario() {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  let loginOk = false;
  let orderOk = false;
  let checkOk = false;

  try {
    // 1. Login
    const loginMs = await doLogin(page);
    loginDuration.add(loginMs);
    loginOk = page.url().includes("/order");
    check(page, { "login: chegou em /order": () => loginOk });
    flowErrors.add(!loginOk);
    if (!loginOk) return;

    // 2. Fluxo de pedido
    const orderMs = await doOrderFlow(page);
    orderFlowDuration.add(orderMs);
    orderOk = page.url().includes("/order");
    check(page, { "order flow: ainda em /order": () => orderOk });
    flowErrors.add(!orderOk);
    if (!orderOk) return;

    // 3. Checkout
    const checkMs = await doCheckout(page);
    checkoutDuration.add(checkMs);
    checkOk = page.url().includes("/order");
    check(page, { "checkout: voltou para grade de mesas": () => checkOk });
    flowErrors.add(!checkOk);

    sleep(isCiProfile ? 2 : 5);

  } catch (err) {
    const msg = errStr(err);
    console.error(`[VU ${__VU} ITER ${__ITER}] falha: ${msg} | url: ${page.url()}`);
    // Registra 1 erro por cada etapa não concluída
    if (!loginOk)  flowErrors.add(1);
    if (!orderOk)  flowErrors.add(1);
    if (!checkOk)  flowErrors.add(1);
  } finally {
    await page.close();
  }
}
