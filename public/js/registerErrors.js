/**
 * Tratamento de erros para a página de cadastro
 * Captura erros do form e do backend, exibindo em uma div de erros
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="/app/signUp"]');
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
    function validateForm(name, email, password) {
        const errors = [];
        
        if (!name || name.trim() === '') {
            errors.push('O campo nome é obrigatório');
        } else if (name.length < 3) {
            errors.push('O nome deve ter pelo menos 3 caracteres');
        } else if (name.length > 50) {
            errors.push('O nome deve ter no máximo 50 caracteres');
        }
        
        if (!email || email.trim() === '') {
            errors.push('O campo email é obrigatório');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('O email deve ser um email válido');
        }
        
        if (!password || password.trim() === '') {
            errors.push('O campo senha é obrigatório');
        } else if (password.length < 8) {
            errors.push('A senha deve ter pelo menos 8 caracteres');
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            errors.push('A senha deve conter maiúsculas, minúsculas, números e caracteres especiais');
        } else if (password.length > 100) {
            errors.push('A senha deve ter no máximo 100 caracteres');
        }
        
        return errors;
    }
    
    // Captura o submit do form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();
        
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        
        // Validação cliente
        const clientErrors = validateForm(name, email, password);
        if (clientErrors.length > 0) {
            displayErrors(clientErrors);
            
            // Adiciona classe error aos inputs inválidos
            if (!name || name.trim() === '' || name.length < 3) {
                form.querySelector('input[name="name"]').classList.add('error');
            }
            if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                form.querySelector('input[name="email"]').classList.add('error');
            }
            if (!password || password.trim() === '' || password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
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
                name: formData.get('name'),
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
            // Se sucesso, redireciona ou mostra mensagem
            if (data.message && data.message.includes('successfully')) {
                // Mostra mensagem de sucesso
                const successContainer = document.querySelector('.success-message');
                if (successContainer) {
                    successContainer.textContent = 'Cadastro realizado com sucesso! Verifique seu email.';
                    successContainer.style.display = 'block';
                    form.reset();
                } else {
                    // Cria mensagem de sucesso
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.textContent = 'Cadastro realizado com sucesso! Verifique seu email.';
                    successMsg.style.cssText = 'color: #388e3c; background-color: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 4px; padding: 15px; margin-bottom: 20px;';
                    form.parentNode.insertBefore(successMsg, form);
                    form.reset();
                }
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
                    'User already exists': 'Usuário já cadastrado com este email.',
                    'Internal server error': 'Erro interno do servidor. Tente novamente mais tarde.',
                    'Preencha os campos obrigatórios': 'Preencha os campos obrigatórios',
                    'O email deve ser um email válido': 'O email deve ser um email válido',
                    'Valor abaixo do tamanho mínimo permitido': 'Valor abaixo do tamanho mínimo permitido',
                    'Valor acima do tamanho máximo permitido': 'Valor acima do tamanho máximo permitido',
                    'A senha deve conter maiúsculas, minúsculas, números e caracteres especiais': 'A senha deve conter maiúsculas, minúsculas, números e caracteres especiais'
                };
                
                if (errorMessages[error.message]) {
                    errors.push(errorMessages[error.message]);
                } else {
                    errors.push(error.message);
                }
            } else {
                errors.push('Ocorreu um erro ao tentar se cadastrar. Tente novamente.');
            }
            
            displayErrors(errors);
            
            // Adiciona classe error aos inputs
            form.querySelector('input[name="email"]').classList.add('error');
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
