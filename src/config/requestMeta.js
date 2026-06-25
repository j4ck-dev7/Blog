// [SECURITY FIX - V16] Sanitização de IP para prevenir log injection
const sanitizeIp = (ip) => {
    if (!ip) return null;
    const match = ip.match(/^[\d.:a-fA-F]+$/);
    return match ? match[0] : null;
};

export const getRequestMeta = (req, extra = {}) => {
    const forwarded = req?.headers?.['x-forwarded-for'];
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : (req?.ip || req?.connection?.remoteAddress || null);
    const ip = sanitizeIp(rawIp);
    const agent = req?.headers?.['user-agent'] || null;
    const route = req?.originalUrl || req?.url || (req?.baseUrl ? `${req.baseUrl}${req.path}` : null);
    const method = req?.method || null;
    const userId = req?.user?._id || req?.user?.id || extra.userId || null;
    const userFreeAccess = req?.user?.state === 'freeAccess' || false;

    return { ip, agent, route, method, userId, userFreeAccess, ...extra };
}
