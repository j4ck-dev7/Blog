/**
 * Subscription page error handling and Stripe integration
 * Handles plan subscription events and error returns
 */

document.addEventListener('DOMContentLoaded', function() {
    const subscriptionButtons = document.querySelectorAll('.subscription-button:not(.current)');
    
    // Map of plan values (from schema.prisma)
    const planValues = {
        basic: 500,
        intermediate: 700,
        premium: 1000
    };

    // Plan hierarchy for validation
    const planHierarchy = {
        free: 0,
        basic: 1,
        intermediate: 2,
        premium: 3
    };

    /**
     * Handle subscription button click
     * Redirects to Stripe checkout via backend
     */
    subscriptionButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const plan = this.dataset.plan;
            
            if (!plan || !['basic', 'intermediate', 'premium'].includes(plan)) {
                showError('Plano de assinatura inválido');
                return;
            }

            try {
                // Get current user subscription from cookie
                const userData = getUserFromCookie();
                
                // Validate if user can upgrade/downgrade
                const validationError = validateSubscriptionChange(userData, plan);
                if (validationError) {
                    showError(validationError);
                    return;
                }

                // Call backend to create Stripe session
                const response = await fetch(`/app/subscribe?subscription=${plan}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                const data = await response.json();
                
                if (!response.ok) {
                    handleSubscriptionError(response.status, data);
                    return;
                }

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    showError('URL de assinatura não retornada');
                }
                
            } catch (error) {
                console.error('Erro ao processar assinatura:', error);
                showError('Erro interno ao processar assinatura');
            }
        });
    });

    /**
     * Highlight current plan on page load
     * This is handled server-side in the EJS template,
     * but we can add client-side validation
     */
    function highlightCurrentPlan() {
        const userData = getUserFromCookie();
        if (!userData || !userData.subscriptionPlan) return;

        const currentPlan = userData.subscriptionPlan;
        const currentCard = document.querySelector(`.subscription-card[data-plan="${currentPlan}"]`);
        
        if (currentCard) {
            currentCard.style.border = '2px solid #4CAF50';
            currentCard.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.3)';
        }
    }

    /**
     * Validate if user can change to the selected plan
     * Prevents downgrading through UI (should be disabled server-side)
     */
    function validateSubscriptionChange(userData, targetPlan) {
        if (!userData || !userData.subscriptionPlan) {
            return null; // No validation needed for guests
        }

        const currentPlan = userData.subscriptionPlan || 'free';
        const currentLevel = planHierarchy[currentPlan] || 0;
        const targetLevel = planHierarchy[targetPlan] || 0;

        // If trying to select a lower plan, show error
        if (targetLevel < currentLevel) {
            return 'Não é possível selecionar um plano inferior ao atual';
        }

        // If already on this plan
        if (currentPlan === targetPlan) {
            return 'Você já está neste plano';
        }

        return null;
    }

    /**
     * Handle subscription errors based on HTTP status
     */
    function handleSubscriptionError(status, data) {
        switch (status) {
            case 400:
                showError(data.message || 'Solicitação inválida. Verifique o plano selecionado.');
                break;
            case 401:
                showError('Usuário não autenticado. Por favor, faça login ou cadastre-se.');
                break;
            case 403:
                showError('Acesso negado. Você não tem permissão para esta ação.');
                break;
            case 404:
                showError('Recurso não encontrado');
                break;
            case 429:
                showError('Muitas solicitações. Por favor, tente novamente mais tarde.');
                break;
            case 500:
                showError(data.message || 'Erro interno do servidor');
                break;
            default:
                showError('Erro desconhecido ao processar assinatura');
        }
    }

    /**
     * Display error message to user
     */
    function showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.subscription-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'subscription-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            background: var(--main-error);
            color: white;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            text-align: center;
            animation: fadeIn 0.3s ease;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            max-width: 80%;
        `;

        // Add to body
        document.body.prepend(errorElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                errorElement.remove();
            }, 300);
        }, 5000);
    }

    /**
     * Parse user data from cookie
     * Note: This is a simplified parse - actual cookie may be JWT
     */
    function getUserFromCookie() {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const userAuthCookie = cookies.userAuth;
        
        if (!userAuthCookie || userAuthCookie === 'freeAccess') {
            return { subscriptionPlan: 'free' };
        }

        // Try to decode JWT (without verification for client-side use)
        try {
            const payload = JSON.parse(atob(userAuthCookie.split('.')[1]));
            return {
                _id: payload._id,
                subscriptionPlan: payload.subscriptionPlan || 'free'
            };
        } catch (e) {
            // Fallback for non-JWT cookies
            return { subscriptionPlan: 'free' };
        }
    }

    /**
     * Disable buttons for plans below current plan
     * This is a client-side fallback for server-side logic
     */
    function disableLowerPlanButtons() {
        const userData = getUserFromCookie();
        if (!userData || !userData.subscriptionPlan) return;

        const currentPlan = userData.subscriptionPlan || 'free';
        const currentLevel = planHierarchy[currentPlan] || 0;

        document.querySelectorAll('.subscription-button').forEach(button => {
            if (!button.dataset.plan) return;
            
            const buttonPlan = button.dataset.plan;
            const buttonLevel = planHierarchy[buttonPlan] || 0;

            // Disable if trying to downgrade
            if (buttonLevel < currentLevel) {
                button.disabled = true;
                button.textContent = 'Plano Inferior';
            }
        });
    }

    // Initialize
    highlightCurrentPlan();
    disableLowerPlanButtons();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);
