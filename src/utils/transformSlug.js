import slugify from "slugify";

export const transformSlug = (slug) => {
    if(slug.length > 100){
        return {
            success: false,
            error: 'invalid slug'
        }
    };

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        const newSlug = slugify(slug, {
            lower: true,
            strict: true,
            locale: 'pt'
        });

        return {
            success: true,
            data: newSlug
        }
    }
};