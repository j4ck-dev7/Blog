export const getRequestMeta = (req, extra = {}) => {
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req?.ip || req?.connection?.remoteAddress || null);
    const agent = req?.headers?.['user-agent'] || null;
    const route = req?.originalUrl || req?.url || (req?.baseUrl ? `${req.baseUrl}${req.path}` : null);
    const method = req?.method || null;
    const userId = req?.user?._id || req?.user?.id || extra.userId || null;
    const userFreeAccess = req?.user?.state === 'freeAccess' || false;

    return { ip, agent, route, method, userId, userFreeAccess, ...extra };
}
