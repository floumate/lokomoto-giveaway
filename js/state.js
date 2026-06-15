// ============================================
// STATE MANAGER — Lokomoto Giveaway prijava
// Drži sve odgovore, istoriju ekrana i UTM
// ============================================

const State = (function() {

  const state = {
    currentScreen: null,     // index step-a ili 'welcome' / 'thanks'
    screenHistory: [],
    screenStartTime: null,

    // Svi odgovori (key === step.id). MRI fajl se drži posebno.
    answers: {},

    // Priloženi MRI fajl (ne ide u answers, posebno se pakuje u payload)
    mriFile: null,           // { name, type, base64 } | null
  };


  // ---------- Odgovori ----------

  function getAnswer(key) {
    return state.answers[key];
  }

  function setAnswer(key, value) {
    state.answers[key] = value;
  }

  function getAllAnswers() {
    return { ...state.answers };
  }

  function setMriFile(file) {
    state.mriFile = file;
  }

  function getMriFile() {
    return state.mriFile;
  }


  // ---------- Navigacija / istorija ----------

  function getCurrentScreen() {
    return state.currentScreen;
  }

  function setCurrentScreen(screenName, options = {}) {
    if (state.currentScreen !== null && !options.skipHistory) {
      state.screenHistory.push(state.currentScreen);
    }
    state.currentScreen = screenName;
    state.screenStartTime = Date.now();
  }

  function getPreviousScreen() {
    return state.screenHistory[state.screenHistory.length - 1] ?? null;
  }

  function popScreenHistory() {
    return state.screenHistory.pop() ?? null;
  }

  function getTimeOnCurrentScreen() {
    if (!state.screenStartTime) return null;
    return Math.round((Date.now() - state.screenStartTime) / 1000);
  }


  // ---------- UTM tracking ----------

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
    };
  }


  function dump() {
    console.log('[STATE]', JSON.parse(JSON.stringify({ ...state, mriFile: state.mriFile ? { name: state.mriFile.name, type: state.mriFile.type, base64: '…' } : null })));
  }


  return {
    getAnswer,
    setAnswer,
    getAllAnswers,
    setMriFile,
    getMriFile,
    getCurrentScreen,
    setCurrentScreen,
    getPreviousScreen,
    popScreenHistory,
    getTimeOnCurrentScreen,
    getUtmParams,
    dump,
  };

})();

console.log('[state.js] učitan');
