import Joi from 'joi';

export const commentSchema = Joi.object({
    post: Joi.string().required().empty().trim().min(1).max(2000),
});

export const commentErrorMap = {
    'any.required':        { logMsg: c => `tentou enviar comentário sem ${c}`,           userMsg: 'Preencha o campo de comentário' },
    'string.empty':        { logMsg: c => `enviou ${c} vazio`,                         userMsg: 'O comentário não pode ficar em branco' },
    'string.min':          { logMsg: c => `enviou ${c} abaixo do mínimo`,                userMsg: 'O comentário deve ter pelo menos 1 caractere' },
    'string.max':          { logMsg: c => `enviou ${c} acima do máximo`,                 userMsg: 'O comentário deve ter no máximo 2000 caracteres' },
};
