const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,

    setupNodeEvents(on, config) {
      // Forzamos al navegador de Cypress a iniciarse en español
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' || browser.name === 'chromium' || browser.name === 'electron') {
          launchOptions.args.push('--lang=es');
        }
        return launchOptions;
      });
    },
  },
});
