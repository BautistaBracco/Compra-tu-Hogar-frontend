describe('Flujo de Login - Compra Tu Hogar', () => {

    beforeEach(() => {
        cy.visit('/login')
    })

    it('Debería cargar el formulario de login correctamente', () => {
        cy.contains('Iniciar Sesión').should('be.visible')
        cy.get('input[placeholder="tu@correo.com"]').should('be.visible')
    })

    it('Debería permitir ir a la pantalla de registro si no tiene cuenta', () => {
        cy.contains('Registrate aquí').click()
        cy.url().should('include', '/register')
    })

    it('Debería iniciar sesión con un usuario válido y redirigir al Home', () => {
        cy.get('input[placeholder="tu@correo.com"]').type('juan@gmail.com')
        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('12345678')

        cy.contains('button', 'Iniciar Sesión').click()

        // Verificamos que entremos al Home exitosamente
        cy.url().should('include', '/home')
        cy.contains('¡Bienvenido').should('be.visible')
    })

    // ==========================================
    // CASOS NEGATIVOS
    // ==========================================

    it('Debería mostrar error si las credenciales son incorrectas', () => {
        cy.get('input[placeholder="tu@correo.com"]').type('usuario.falso@correo.com')
        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('claveIncorrecta123')
        cy.contains('button', 'Iniciar Sesión').click()

        cy.contains('Correo o contraseña incorrectos').should('be.visible')

        // Nos aseguramos de que seguimos en la pantalla de login y NO entró al home
        cy.url().should('include', '/login')
    })

    it('Debería validar el formato del correo electrónico', () => {
        // 1. Apuntamos al input de email
        const emailInput = 'input[placeholder="tu@correo.com"]'

        // 2. Escribimos un mail inválido sin @ ni dominio
        cy.get(emailInput).type('correoInvalido')
        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('12345678')

        // 3. Intentamos clickear el botón para disparar la validación nativa
        cy.contains('button', 'Iniciar Sesión').click()

        // 4. Verificamos que el navegador marque el campo como INVÁLIDO
        cy.get(emailInput).then(($el) => {
            const validity = $el[0].validity
            expect(validity.valid).to.be.false // El campo NO es válido
            expect(validity.typeMismatch).to.be.true // Falló específicamente porque no es tipo email
        })

        // 5. Nos aseguramos de que la página NO se desvió al home
        cy.url().should('include', '/login')
    })

    it('Debería mostrar alertas de campos requeridos si se envía vacío', () => {
        const emailInput = 'input[placeholder="tu@correo.com"]'
        const passwordInput = 'input[placeholder="Mínimo 8 caracteres"]'

        // 1. Intentamos hacer click directo con los campos vacíos
        cy.contains('button', 'Iniciar Sesión').click()

        // 2. Verificamos que el navegador marque el campo de email como inválido por estar vacío
        cy.get(emailInput).then(($el) => {
            const validity = $el[0].validity
            const msg = $el[0].validationMessage;
            expect(validity.valid).to.be.false // No es válido
            expect(validity.valueMissing).to.be.true // Específicamente falta el valor requerido

            expect(msg).to.be.oneOf(['Completa este campo.', 'Please fill out this field.']);
        })

        // 3. Completamos el email para verificar que el requerimiento salte ahora en la contraseña
        cy.get(emailInput).type('test@correo.com')
        cy.contains('button', 'Iniciar Sesión').click()

        // 4. Verificamos que ahora sea el campo de contraseña el que reclama el valor
        cy.get(passwordInput).then(($el) => {
            const validity = $el[0].validity
            const msg = $el[0].validationMessage;
            expect(validity.valid).to.be.false
            expect(validity.valueMissing).to.be.true
            expect(msg).to.be.oneOf(['Completa este campo.', 'Please fill out this field.']);
        })

        cy.url().should('include', '/login')
    })
})