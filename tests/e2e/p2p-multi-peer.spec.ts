import { test, expect, type Page } from '@playwright/test';

async function initIdentity(page: Page, username: string): Promise<void> {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByLabel('Choose your username').fill(username);
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('button', { name: 'Add a Server' })).toBeVisible();
}

async function createServerAndGetInvite(page: Page, serverName: string): Promise<string> {
  await page.getByRole('button', { name: 'Add a Server' }).click();
  await page.getByLabel('Server name').fill(serverName);
  await page.getByRole('button', { name: 'Create Community' }).click();
  await expect(page.getByRole('heading', { name: serverName })).toBeVisible();

  await page.getByRole('button', { name: 'Invite People' }).click();
  const codeBlock = page.locator('p.font-mono.break-all');
  await expect(codeBlock).toBeVisible();
  const inviteCode = (await codeBlock.innerText()).trim();
  expect(inviteCode.length).toBeGreaterThan(20);

  await page.keyboard.press('Escape');
  return inviteCode;
}

async function joinServerWithInvite(page: Page, inviteCode: string, serverName: string): Promise<void> {
  await page.getByRole('button', { name: 'Join a Server' }).click();
  await page.getByLabel('Invite Code').fill(inviteCode);
  await page.getByRole('button', { name: 'Join Server' }).click();
  await expect(page.getByRole('heading', { name: serverName })).toBeVisible();
}

test.describe('OffGrid Multi-Peer WebRTC Protocols', () => {
  test('host + member chat, missed-history sync, E2E DM + Safety Number verification, and host migration', async ({
    browser,
  }) => {
    const aliceContext = await browser.newContext();
    const bobContext = await browser.newContext();

    try {
      const alicePage = await aliceContext.newPage();
      const bobPage = await bobContext.newPage();

      alicePage.on('pageerror', (err) => console.error('[Alice pageerror]', err.message));
      bobPage.on('pageerror', (err) => console.error('[Bob pageerror]', err.message));
      alicePage.on('console', (msg) => {
        if (msg.type() === 'error') console.error('[Alice console.error]', msg.text());
      });
      bobPage.on('console', (msg) => {
        if (msg.type() === 'error') console.error('[Bob console.error]', msg.text());
      });

      // 1. Both peers initialize distinct identities against local PeerServer
      await Promise.all([initIdentity(alicePage, 'Alice'), initIdentity(bobPage, 'Bob')]);

      // 2. Alice creates community server and exports signed invite
      const inviteCode = await createServerAndGetInvite(alicePage, 'Mesh Guild');

      // 3. Bob joins server over real WebRTC (RT + Bulk DataChannels)
      await joinServerWithInvite(bobPage, inviteCode, 'Mesh Guild');

      // Verify Channel DTLS clarity and presence on both peers
      await expect(alicePage.getByText('WebRTC DTLS · Host-Relayed')).toBeVisible();
      await expect(bobPage.getByText('WebRTC DTLS · Host-Relayed')).toBeVisible();
      await expect(alicePage.getByText('2 online')).toBeVisible();
      await expect(bobPage.getByText('2 online')).toBeVisible();

      // 4. Real-time channel messaging both directions
      const aliceMsgInput = alicePage.getByLabel(/^Message #/);
      await aliceMsgInput.fill('Hello Bob from Alice');
      await aliceMsgInput.press('Enter');
      await expect(bobPage.getByText('Hello Bob from Alice')).toBeVisible();

      const bobMsgInput = bobPage.getByLabel(/^Message #/);
      await bobMsgInput.fill('Hello Alice from Bob');
      await bobMsgInput.press('Enter');
      await expect(alicePage.getByText('Hello Alice from Bob')).toBeVisible();

      // 5. Missed-history sync over reconnection (Bob goes offline, Alice sends 3 messages, Bob resumes session)
      await bobPage.close({ runBeforeUnload: true });
      await expect(alicePage.getByText('1 online')).toBeVisible();

      await aliceMsgInput.fill('Catch-up message 1');
      await aliceMsgInput.press('Enter');
      await aliceMsgInput.fill('Catch-up message 2');
      await aliceMsgInput.press('Enter');
      await aliceMsgInput.fill('Catch-up message 3');
      await aliceMsgInput.press('Enter');

      const bobRejoinedPage = await bobContext.newPage();
      bobRejoinedPage.on('pageerror', (err) => console.error('[Bob2 pageerror]', err.message));
      bobRejoinedPage.on('console', (msg) => {
        if (msg.type() === 'error') console.error('[Bob2 console.error]', msg.text());
      });
      await bobRejoinedPage.goto('/');
      await bobRejoinedPage.getByRole('button', { name: 'Resume Previous Session' }).click();
      await expect(bobRejoinedPage.getByRole('heading', { name: 'Mesh Guild' })).toBeVisible();

      // Verify Yjs state-vector catch-up sync delivered all 3 missed messages
      await expect(bobRejoinedPage.getByText('Catch-up message 1')).toBeVisible();
      await expect(bobRejoinedPage.getByText('Catch-up message 2')).toBeVisible();
      await expect(bobRejoinedPage.getByText('Catch-up message 3')).toBeVisible();

      // 6. End-to-End Encrypted DM + Bidirectional Safety Number Verification
      await bobRejoinedPage.getByRole('button', { name: 'Message Alice' }).click();
      const bobDmInput = bobRejoinedPage.getByLabel('Message @Alice');
      await bobDmInput.fill('Top secret encrypted DM');
      await bobDmInput.press('Enter');

      await alicePage.getByRole('button', { name: 'Direct Messages' }).click();
      await alicePage.getByRole('button', { name: /Bob/i }).first().click();
      await expect(alicePage.getByRole('main').getByText('Top secret encrypted DM')).toBeVisible();

      // Open Safety Number dialogs on both sides and confirm identical 60-digit fingerprint
      await bobRejoinedPage.getByLabel('Verify safety number', { exact: true }).click();
      const bobGrid = bobRejoinedPage.getByTestId('safety-number-grid');
      await expect(bobGrid).toBeVisible();
      const bobSafetyNumber = (await bobGrid.innerText()).replace(/\s+/g, ' ').trim();
      expect(bobSafetyNumber).toMatch(/^(\d{5} ){11}\d{5}$/);

      await alicePage.getByLabel('Verify safety number', { exact: true }).click();
      const aliceGrid = alicePage.getByTestId('safety-number-grid');
      await expect(aliceGrid).toBeVisible();
      const aliceSafetyNumber = (await aliceGrid.innerText()).replace(/\s+/g, ' ').trim();

      expect(aliceSafetyNumber).toBe(bobSafetyNumber);
      await alicePage.keyboard.press('Escape');

      // Bob marks Alice as verified and verifies header reflects Verified status
      await bobRejoinedPage.getByRole('button', { name: 'Mark as Verified' }).click();
      await expect(bobRejoinedPage.getByRole('button', { name: 'Unverify Peer' })).toBeVisible();
      await bobRejoinedPage.keyboard.press('Escape');
      await expect(bobRejoinedPage.getByLabel('Verify safety number', { exact: true })).toContainText('Verified');

      // Switch Bob back to server view to observe host migration
      await bobRejoinedPage.getByRole('button', { name: 'Mesh Guild' }).click();
      await expect(bobRejoinedPage.getByText('Status').locator('..')).toContainText(/connected/i);

      // 7. Host Migration: Alice disconnects cleanly; Bob detects disconnect and elects himself host
      await alicePage.close({ runBeforeUnload: true });
      await aliceContext.close();

      await expect(bobRejoinedPage.getByText('Status').locator('..')).toContainText(/host/i, {
        timeout: 20_000,
      });

      const bobPostMigrationInput = bobRejoinedPage.getByLabel(/^Message #/);
      await bobPostMigrationInput.fill('Message sent as new host');
      await bobPostMigrationInput.press('Enter');
      await expect(bobRejoinedPage.getByText('Message sent as new host')).toBeVisible();
    } finally {
      await aliceContext.close().catch(() => {});
      await bobContext.close().catch(() => {});
    }
  });
});
