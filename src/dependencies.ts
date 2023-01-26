import { KNOWN_PACKAGE_SIZES, KNOWN_SHIPPING_PROVIDERS, MAX_MONTHLY_DISCOUNT_THRESHOLD, pricing } from './constants'

export interface MonthMapperInstance {
    largeShipmentCount: number
    accumulatedDiscount: number
}

export function monthMapper() {
    /* '2023-01': {
        shipmentCount: 3,
        accumulatedDiscount: 7
    } */
    const dates: Record<string, MonthMapperInstance> = {}

    function get(date: string) {
        if (dates[date] === undefined) {
            dates[date] = { accumulatedDiscount: 0, largeShipmentCount: 0 }
            return dates[date]
        }
        return (() => dates[date])()
    }

    function set(date: string, key: keyof MonthMapperInstance, value: number) {
        if (dates[date] === undefined) {
            dates[date] = { accumulatedDiscount: 0, largeShipmentCount: 0 }
        }
        return (dates[date][key] = value)
    }

    return { get, set }
}

export type Dependencies = typeof dependencies
export const dependencies = {
    maxMonthlyDiscountThreshold: MAX_MONTHLY_DISCOUNT_THRESHOLD,
    monthMapper: monthMapper(),
    pricing,
    knownProviders: KNOWN_SHIPPING_PROVIDERS,
    knownPackageSizes: KNOWN_PACKAGE_SIZES,
}
