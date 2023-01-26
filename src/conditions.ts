import { Condition, PackageProvider, PackageSize } from './rule-engine/types'
import { dateToDateMonth } from './rule-engine/utils'

export const isPackageSize: Condition =
    (size: PackageSize) =>
    ({ fact }) => {
        return fact.packageSize === size
    }

export const isProvider: Condition =
    (provider: PackageProvider) =>
    ({ fact }) =>
        fact.shippingProvider === provider

export const isMonthlyShipmentNumber: Condition =
    (count: number) =>
    ({ fact, dependencies }) => {
        const { monthMapper } = dependencies
        const dateString = dateToDateMonth(fact.date)
        const { largeShipmentCount } = monthMapper.get(dateString)
        return largeShipmentCount === count
    }

export const isAllowedToGiveDiscount: Condition =
    (discountLimit: number) =>
    ({ fact, dependencies }) => {
        const { monthMapper } = dependencies
        const dateString = dateToDateMonth(fact.date)
        const { accumulatedDiscount } = monthMapper.get(dateString)
        return accumulatedDiscount < discountLimit
    }

export const onlyKnownShippingProvider: Condition =
    () =>
    ({ fact, dependencies: { knownProviders } }) =>
        knownProviders.includes(fact.shippingProvider)
