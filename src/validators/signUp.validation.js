import Joi from 'joi';

export const signUpSchema = Joi.object({
    name: Joi.string().required().empty().min(3).max(50),
    email: Joi.string().required().empty().email().min(13).max(50),
    password: Joi.string().required().empty()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .min(8).max(100),
});

export const signUpErrorMap = {
    'any.required':        { logMsg: c => `tentou registrar sem ${c}`,                             userMsg: 'Preencha os campos obrigatórios' },
    'string.empty':        { logMsg: c => `enviou ${c} vazio`,                                     userMsg: 'Preencha os campos obrigatórios' },
    'string.min':          { logMsg: c => `enviou ${c} abaixo do mínimo`,                          userMsg: 'Valor abaixo do tamanho mínimo permitido' },
    'string.max':          { logMsg: c => `enviou ${c} acima do máximo`,                           userMsg: 'Valor acima do tamanho máximo permitido' },
    'string.email':        { logMsg: c => `enviou email inválido`,                                 userMsg: 'O email deve ser um email válido' },
    'string.pattern.base': { logMsg: c => `enviou ${c} fora do padrão`,                            userMsg: 'A senha deve conter maiúsculas, minúsculas, números e caracteres especiais' },
};
