// ============================================
// API CLIENT — Lokomoto Giveaway prijava
// Šalje finalni payload na Make.com webhook.
// U Make scenariju: MRI fajl (base64) ide na "Google Drive > Upload a file",
// a dobijeni link + ostala polja idu u Google Sheets red.
// ============================================

const API = (function() {

  const WEBHOOK_URL = 'https://hook.eu1.make.com/81eilkx1tl9xxsi915kajukkc8mwudil';

  /**
   * Šalje kompletan payload na webhook i čeka odgovor.
   * NAPOMENA: BEZ keepalive — fetch standard ograničava keepalive zahteve na 64KB
   * body-ja, pa bi slanje sa priloženim MRI snimkom (base64) puklo. Forma ne radi
   * redirect posle slanja (thank-you je u mestu), pa keepalive i nije potreban.
   */
  async function submitForm(payload) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('[api] Webhook HTTP greška:', response.status);
        return { success: false, status: response.status };
      }

      return { success: true };
    } catch (err) {
      console.error('[api] Mrežna greška pri slanju:', err);
      return { success: false, networkError: true };
    }
  }


  function getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
    if (/ipad|tablet/.test(ua)) return 'tablet';
    return 'desktop';
  }


  return {
    submitForm,
    getDeviceType,
  };

})();

console.log('[api.js] učitan, webhook:', 'hook.eu1.make.com/…udil');
