/**
 * Tratamento de erros para a página de login
 * Captura erros do form e do backend, exibindo em uma div de erros
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="/app/signIn"]');
    const errorContainer = document.createElement('div');
    errorContainer.id = 'form-errors';
    errorContainer.className = 'error-container';
    
    // Adiciona o container de erros antes do form
    form.parentNode.insertBefore(errorContainer, form);
    
    // Estilos básicos para o container de erros
    const style = document.createElement('style');
    style.textContent = `
        .error-container {
            color: #d32f2f;
            background-color: #ffebee;
            border: 1px solid #ef9a9a;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
            display: none;
        }
        .error-container ul {
            margin: 0;
            padding-left: 20px;
            list-style-type: disc;
        }
        .error-container li {
            margin: 5px 0;
        }
        .error-container.show {
            display: block;
        }
        .form-group input.error {
            border: 1px solid #d32f2f !important;
        }
    `;
    document.head.appendChild(style);
    
    // Função para exibir erros
    function displayErrors(errors) {
        errorContainer.innerHTML = '';
        
        if (!errors || errors.length === 0) {
            errorContainer.classList.remove('show');
            return;
        }
        
        const ul = document.createElement('ul');
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            ul.appendChild(li);
        });
        
        errorContainer.appendChild(ul);
        errorContainer.classList.add('show');
        
        // Scroll para os erros
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Função para limpar erros
    function clearErrors() {
        errorContainer.classList.remove('show');
        errorContainer.innerHTML = '';
        
        // Remove classe error dos inputs
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }
    
    // Validação cliente-side
    function validateForm(email, password) {
        const errors = [];
        
        if (!email || email.trim() === '') {
            errors.push('O campo email é obrigatório');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('O email deve ser um email válido');
        }
        
        if (!password || password.trim() === '') {
            errors.push('O campo senha é obrigatório');
        } else if (password.length < 8) {
            errors.push('A senha deve ter pelo menos 8 caracteres');
        }
        
        return errors;
    }
    
    // Captura o submit do form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        
        // Validação cliente
        const clientErrors = validateForm(email, password);
        if (clientErrors.length > 0) {
            displayErrors(clientErrors);
            
            // Adiciona classe error aos inputs inválidos
            if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                form.querySelector('input[name="email"]').classList.add('error');
            }
            if (!password || password.trim() === '' || password.length < 8) {
                form.querySelector('input[name="password"]').classList.add('error');
            }
            
            return;
        }
        
        // Se válido, submete o form
        submitForm(form);
    });
    
    // Função para submeter o form via fetch
    function submitForm(formElement) {
        const formData = new FormData(formElement);
        
        fetch(formElement.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            }),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err;
                });
            }
            return response.json();
        })
        .then(data => {
            // Se sucesso, redireciona
            if (data.message === 'User logged in successfully') {
                window.location.href = '/';
            }
        })
        .catch(error => {
            let errors = [];
            
            // Trata erros do backend
            if (error.error) {
                if (typeof error.error === 'string') {
                    errors.push(error.error);
                } else if (Array.isArray(error.error)) {
                    errors = errors.concat(error.error);
                }
            } else if (error.message) {
                // Mapeia mensagens de erro do backend
                const errorMessages = {
                    'Incorrect email or password': 'Email ou senha incorretos',
                    'Email não verificado': 'Email não verificado. Por favor, verifique seu email.',
                    'Usuário bloqueado por muitas tentativas': 'Conta bloqueada por muitas tentativas de login. Tente novamente mais tarde.',
                    'Incorrect email or password': 'Email ou senha incorretos',
                    'Internal server error': 'Erro interno do servidor. Tente novamente mais tarde.',
                    'Preencha os campos obrigatórios': 'Preencha os campos obrigatórios',
                    'O email deve ser um email válido': 'O email deve ser um email válido'
                };
                
                if (errorMessages[error.message]) {
                    errors.push(errorMessages[error.message]);
                } else {
                    errors.push(error.message);
                }
            } else {
                errors.push('Ocorreu um erro ao Tentar fazer login. Tente novamente.');
            }
            
            // Adiciona informações de tentativas restantes se existir
            if (error.attemptsRemaining !== undefined) {
                errors.push(`Tentativas restantes: ${error.attemptsRemaining}`);
            }
            
            displayErrors(errors);
            
            // Adiciona classe error aos inputs
            form.querySelector('input[name="email"]').classList.add('error');
            form.querySelector('input[name="password"]').classList.add('error');
        });
    }
    
    // Limpa erros ao digitar
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            
            // Se não houver mais inputs com erro, esconde o container
            const hasErrors = form.querySelectorAll('input.error').length > 0;
            if (!hasErrors && errorContainer.innerHTML === '') {
                errorContainer.classList.remove('show');
            }
        });
    });
    
    // Verifica se há erros do servidor na página (renderizados pelo EJS)
    const serverError = document.querySelector('.error-message');
    if (serverError && serverError.textContent.trim()) {
        displayErrors([serverError.textContent.trim()]);
    }
});
