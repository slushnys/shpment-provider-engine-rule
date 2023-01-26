const laPostePricing = {
    S: 1.5,
    M: 4.9,
    L: 6.9,
}
const mrPricing = {
    S: 2,
    M: 3,
    L: 4,
}

export const pricing = {
    LP: laPostePricing,
    MR: mrPricing,
}
export const MAX_MONTHLY_DISCOUNT_THRESHOLD = 10

export const KNOWN_SHIPPING_PROVIDERS = ['LP', 'MR']

export const KNOWN_PACKAGE_SIZES = ['S', 'M', 'L']
