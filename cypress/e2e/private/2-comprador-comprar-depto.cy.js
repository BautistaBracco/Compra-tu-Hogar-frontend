describe('Flujo: Comprador compra departamento', () => {
  const EMAIL = 'nestor@gmail.com';
  const PASSWORD = '12345678';

  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debería comprar un departamento disponible exitosamente', () => {
    // ==========================================
    // PASO 1: LOGIN COMO COMPRADOR
    // ==========================================
    cy.get('input[placeholder="tu@correo.com"]').type(EMAIL);
    cy.get('input[placeholder="Mínimo 8 caracteres"]').type(PASSWORD);
    cy.contains('button', 'Iniciar Sesión').click();

    // Verificamos que entremos al Home
    cy.url().should('include', '/home');
    cy.contains('¡Bienvenido').should('be.visible');

    // ==========================================
    // PASO 2: NAVEGAMOS A PROPIEDADES
    // ==========================================
    cy.contains('a', 'Propiedades').click();

    // Verificamos que estamos en la página de propiedades
    cy.url().should('include', '/propiedades');
    cy.contains('Propiedades disponibles').should('be.visible');

    // Esperamos a que carguen las publicaciones
    cy.get('.properties-list', { timeout: 10000 }).should('be.visible');

// ==========================================
    // PASO 3: BUSCAR Y SELECCIONAR PROPIEDAD DISPONIBLE (RECURSIVO)
    // ==========================================
    const findAvailableProperty = () => {
      // Intentamos encontrar el elemento
      cy.get('body').then(($body) => {
        // Si el botón está visible, hacemos clic
        if ($body.find('.property-group-card .property-status.available:visible').length > 0) {
          cy.get('.property-group-card .property-status.available:visible')
              .first()
              .scrollIntoView()
              .parents('.property-group-card')
              .first()
              .within(() => {
                cy.contains('button', 'Ver opciones y fotos').click();
              });
        } else {
          // Si no está, hacemos scroll hacia abajo y volvemos a llamar a la función
          cy.scrollTo('bottom');
          cy.wait(500); // Pequeña pausa para permitir renderizado
          findAvailableProperty();
        }
      });
    };

    findAvailableProperty();

    // ==========================================
    // PASO 4: VERIFICAR QUE ESTAMOS EN LA PÁGINA DE PROPIEDAD
    // ==========================================
    cy.url().should('include', '/propiedades/propiedad/');

    // Esperamos a que cargue el detalle de la propiedad
    cy.contains('h2', 'Elegí la inmobiliaria', { timeout: 10000 }).should('be.visible');

    // ==========================================
    // PASO 5: SELECCIONAR LA PRIMERA OFERTA (AUTOMÁTICA)
    // ==========================================
    // La primera oferta debería estar seleccionada por defecto
    cy.get('button.offer-tab.active', { timeout: 5000 }).should('exist');

    // ==========================================
    // PASO 6: VERIFICAR QUE LA OFERTA NO ESTÁ VENDIDA
    // ==========================================
    // Verificamos estado disponible en el sidebar
    cy.get('.property-sidebar-meta').should('contain', 'Disponible');

    // ==========================================
    // PASO 7: HACER CLIC EN COMPRAR
    // ==========================================
    // Scroll de página hasta acciones para comprar
    cy.scrollTo('bottom', { duration: 800 });
    cy.contains('button', 'Comprar')
      .scrollIntoView()
      .should('be.enabled')
      .click();

    // ==========================================
    // PASO 8: VERIFICAR QUE SE MOSTRÓ LA CONFIRMACIÓN DE COMPRA
    // ==========================================
    // Esperamos a que aparezca el mensaje flotante de éxito
    cy.contains('¡Compra realizada con éxito!', { timeout: 10000 }).should('be.visible');

    // Verificamos que el mensaje de éxito se muestre
    cy.get('.floating-message-card').within(() => {
      cy.contains('¡Compra realizada con éxito!').should('be.visible');
    });

    // ==========================================
    // PASO 9: CERRAR EL MENSAJE
    // ==========================================
    cy.get('.floating-message-card').within(() => {
      cy.contains('button', 'Cerrar').click();
    });

    // ==========================================
    // PASO 10: VERIFICAR QUE LA PROPIEDAD AHORA ESTÁ VENDIDA
    // ==========================================
    cy.get('.property-sidebar-meta').should('contain', 'Vendida').scrollIntoView();

    // El botón de comprar debe estar deshabilitado (mostrar "Vendida")
    cy.contains('button', 'Vendida').should('be.disabled');
  });
});
