describe('Flujo de Registro - Compra Tu Hogar', () => {

    beforeEach(() => {
        cy.visit('/register')
    })

    it('Debería cargar el formulario de registro correctamente', () => {
        cy.contains('Crear Cuenta').should('be.visible')
    })

    it('Debería permitir ir a la pantalla de login si ya tiene cuenta', () => {
        cy.contains('Inicia sesión aquí').click()
        cy.url().should('include', '/login')
    })

    it('Debería registrar un nuevo usuario exitosamente con datos válidos', () => {
        // Esto genera un correo único cada vez que corre el test (ej: test_1717100000@correo.com)
        const emailUnico = `test_${Date.now()}@correo.com`

        cy.get('input[placeholder="Juan Pérez"]').type('Mauricio Test')
        cy.get('input[placeholder="tu@correo.com"]').type(emailUnico)

        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('Contrasenia123')
        cy.get('input[placeholder="Repite tu contraseña"]').type('Contrasenia123')

        cy.contains('button', 'Crear Cuenta').click()

        // Verificamos que el registro procese y salga de la página de register
        cy.url().should('not.include', '/register')
    })

    // ==========================================
    // CASOS NEGATIVOS
    // ==========================================

    it('Debería validar los campos requeridos nativos si se envía vacío', () => {
        const nameInput = 'input[placeholder="Juan Pérez"]'

        // Intentamos enviar el formulario vacío
        cy.contains('button', 'Crear Cuenta').click()

        // El primer campo vacío (Nombre) debería saltar como inválido
        cy.get(nameInput).then(($el) => {
            const validity = $el[0].validity
            const msg = $el[0].validationMessage;
            expect(validity.valid).to.be.false
            expect(validity.valueMissing).to.be.true
            expect(msg).to.be.oneOf(['Completa este campo.', 'Please fill out this field.']);
        })

        cy.url().should('include', '/register')
    })

    it('Debería validar el formato del correo electrónico en el registro', () => {
        const emailInput = 'input[placeholder="tu@correo.com"]'

        cy.get('input[placeholder="Juan Pérez"]').type('Mauricio Test')
        cy.get(emailInput).type('correoSinArrobaYMal')

        cy.contains('button', 'Crear Cuenta').click()

        cy.get(emailInput).then(($el) => {
            const validity = $el[0].validity
            expect(validity.valid).to.be.false
            expect(validity.typeMismatch).to.be.true
        })
    })

    it('Debería exigir que la contraseña tenga el mínimo de caracteres requerido', () => {
        const passwordInput = 'input[placeholder="Mínimo 8 caracteres"]'

        cy.get('input[placeholder="Juan Pérez"]').type('Mauricio Test')
        cy.get('input[placeholder="tu@correo.com"]').type(`test_${Date.now()}@correo.com`)

        // Escribimos una contraseña muy corta (menos de 8 caracteres)
        cy.get(passwordInput).type('12345')
        cy.get('input[placeholder="Repite tu contraseña"]').type('12345')

        cy.contains('button', 'Crear Cuenta').click()

        cy.contains('La contraseña debe tener mínimo 8 caracteres').should('be.visible')

        // Verificamos que no haya avanzado de página
        cy.url().should('include', '/register')
    })

    it('Debería mostrar error si las contraseñas no coinciden', () => {
        cy.get('input[placeholder="Juan Pérez"]').type('Mauricio Test')
        cy.get('input[placeholder="tu@correo.com"]').type(`test_${Date.now()}@correo.com`)

        // Ponemos contraseñas totalmente distintas
        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('Contrasenia123')
        cy.get('input[placeholder="Repite tu contraseña"]').type('Diferente456')

        cy.contains('button', 'Crear Cuenta').click()

        cy.contains('Las contraseñas no coinciden').should('be.visible')
        cy.url().should('include', '/register')
    })

    it('Debería mostrar error si el email ya se encuentra registrado en el sistema', () => {
        // Se usa el mail registrado en la base de datos
        const emailExistente = 'juan@gmail.com'

        cy.get('input[placeholder="Juan Pérez"]').type('Juan Duplicado')
        cy.get('input[placeholder="tu@correo.com"]').type(emailExistente)
        cy.get('input[placeholder="Mínimo 8 caracteres"]').type('12345678')
        cy.get('input[placeholder="Repite tu contraseña"]').type('12345678')

        cy.contains('button', 'Crear Cuenta').click()

        cy.contains('El email ya está en uso').should('be.visible')
        cy.url().should('include', '/register')
    })
})