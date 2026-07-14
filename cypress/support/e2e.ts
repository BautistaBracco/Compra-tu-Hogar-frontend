// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import { slowCypressDown } from 'cypress-slow-down';

// Solo ejecuta la función si es el modo interactivo
if (Cypress.config('isInteractive')) {
    slowCypressDown(1000);
}