describe('Compra Tu Hogar - Landing Page & Navegación', () => {

    beforeEach(() => {
        cy.visit('/landing')
        // Nos aseguramos de que la landing terminó de cargar el título principal
        cy.contains('Encuentra Tu Hogar Ideal').should('be.visible')
    })

    it('Debería cargar la landing correctamente y mostrar las secciones', () => {
        cy.contains('¿Por qué Compra Tu Hogar?').should('be.visible')
    })

    it('Debería redirigir al Login desde el botón Iniciar Sesión del Navbar', () => {
        // Buscamos el texto "Iniciar Sesión" que esté visible y le damos click
        cy.contains('Iniciar Sesión').should('be.visible').click()
        cy.url().should('include', '/login')
    })

    it('Debería redirigir al Registro desde el botón Registrarse del Navbar', () => {
        cy.contains('Registrarse').should('be.visible').click()
        cy.url().should('include', '/register')
    })

    it('Debería redirigir al Registro desde el botón Comenzar Ahora', () => {
        cy.contains('Comenzar Ahora').should('be.visible').click()
        cy.url().should('include', '/register')
    })

    it('Debería hacer scroll hacia abajo al hacer click en "Saber Más"', () => {
        // 1. Verificamos que al principio el scroll de la pantalla esté arriba de todo (en 0)
        cy.window().its('scrollY').should('equal', 0)

        // 2. Hacemos click en el botón "Saber Más"
        cy.contains('Saber Más').click()

        // 3. Comprobamos que el scroll actual sea mayor que 0 (es decir, la pantalla se movió hacia abajo)
        cy.window().its('scrollY').should('be.greaterThan', 0)
    })

    it('Debería redirigir al Registro desde el botón Crear Cuenta Gratis del footer', () => {
        // Usamos scrollIntoView por si Cypress no llega a verlo por la altura de la pantalla
        cy.contains('Crear Cuenta Gratis').scrollIntoView().should('be.visible').click()
        cy.url().should('include', '/register')
    })
})