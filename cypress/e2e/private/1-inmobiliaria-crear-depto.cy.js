describe('Flujo: Inmobiliaria crea departamento', () => {
  const EMAIL = 'InmobiliariaAlfonso@gmail.com';
  const PASSWORD = '12345678';
  const IMAGE_URL = 'https://www.argencasas.com/fotos/102/586/3870451184.jpg';

  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debería crear un departamento exitosamente', () => {
    // ==========================================
    // PASO 1: LOGIN
    // ==========================================
    cy.get('input[placeholder="tu@correo.com"]').type(EMAIL);
    cy.get('input[placeholder="Mínimo 8 caracteres"]').type(PASSWORD);
    cy.contains('button', 'Iniciar Sesión').click();

    // Verificamos que entremos al Home
    cy.url().should('include', '/home');
    cy.contains('¡Bienvenido').should('be.visible');

    // ==========================================
    // PASO 2: NAVEGAMOS AL PANEL INMOBILIARIA
    // ==========================================
    // Buscamos el botón o enlace del panel inmobiliaria
    // El panel inmobiliaria está en /inmobiliaria
    cy.visit('/inmobiliaria');

    // Verificamos que estamos en el panel
    cy.contains('Panel de Inmobiliaria').should('be.visible');
    cy.contains('Inicio').should('be.visible');

    // ==========================================
    // PASO 3: VAMOS A LA PESTAÑA CREAR
    // ==========================================
    cy.contains('button', 'Crear / Editar').click();

    // Verificamos que estamos en la sección de crear
    cy.contains('Crear publicación').should('be.visible');
    cy.get('textarea#descripcion-publicacion').should('be.visible');

    // ==========================================
    // PASO 4: LLENAMOS EL FORMULARIO
    // ==========================================

    // Usamos timestamp para que cada ejecución cree un depto nuevo
    const timestamp = Date.now();
    const descripcion = `Departamento Test Compra - ${timestamp}`;
    const precio = '250000';
    const ubicacion = `Palermo Test - ${timestamp}`;
    const piso = '3';
    const depto = 'A';
    const superficie = '85';
    const ambientes = '2';
    const sanitarios = '1';
    const expensas = '5000';

    // Descripción
    cy.get('textarea#descripcion-publicacion').type(descripcion);

    // Precio
    cy.get('input#precio-publicacion').type(precio);

    // ==========================================
    // PASO 5: AGREGAR IMAGEN
    // ==========================================
    cy.get('input#imagen-url-publicacion').type(IMAGE_URL);
    cy.get('button.image-add-button').click();

    // Verificamos que la imagen se agregó
    cy.contains(`1 imagen(es) cargada(s)`).should('be.visible');

    // ==========================================
    // PASO 6: COMPLETAR DATOS DE PROPIEDAD
    // ==========================================

    // Tipo (DEPTO ya está seleccionado por defecto)
    cy.get('select#tipo-propiedad').should('have.value', 'DEPTO');

    // Ubicación
    cy.get('input#ubicacion-propiedad').type(ubicacion);

    // Esperamos un poco para que se ejecute el lookup automático
    cy.wait(1000);

    // Piso
    cy.get('select#piso-propiedad').select(piso);

    // Depto
    cy.get('input#depto-propiedad').type(depto);

    // Superficie
    cy.get('input#superficie-propiedad').type(superficie);

    // Ambientes
    cy.get('input#ambientes-propiedad').type(ambientes);

    // Sanitarios
    cy.get('input#sanitarios-propiedad').type(sanitarios);

    // Expensas
    cy.get('input#expensas-propiedad').type(expensas);

    // ==========================================
    // PASO 7: SELECCIONAR CARACTERÍSTICAS
    // ==========================================
    cy.get('.characteristic-selector input[type="checkbox"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then(($checks) => {
        const cantidad = Math.min($checks.length, 2);
        for (let i = 0; i < cantidad; i += 1) {
          cy.wrap($checks[i]).check({ force: true });
        }
      });

    // Verificamos que al menos una característica quede seleccionada
    cy.get('.characteristic-selector input[type="checkbox"]:checked').should('have.length.greaterThan', 0);

    // ==========================================
    // PASO 8: CREAR PUBLICACIÓN
    // ==========================================
    cy.contains('button', 'Crear publicación').click();

    // Verificamos que se creó exitosamente
    cy.contains('¡Publicación creada exitosamente!').should('be.visible');

    // Verificamos que el formulario se limpió
    cy.get('textarea#descripcion-publicacion').should('have.value', '');
    cy.get('input#precio-publicacion').should('have.value', '');

    // ==========================================
    // PASO 9: VERIFICAR QUE LA PUBLICACIÓN APARECE EN LA LISTA
    // ==========================================
    cy.contains('button', 'Publicaciones').click();

    // Esperamos que cargue la lista
    cy.contains('Mis publicaciones').should('be.visible');

    // Verificamos que nuestra publicación aparece
    cy.contains(descripcion).should('be.visible');
  });
});

