import { makeRule } from './rule-engine/rule'
import { isPackageSize, isProvider, isMonthlyShipmentNumber, onlyKnownShippingProvider } from './conditions'
import { dateToDateMonth } from './rule-engine/utils'

export const ignoreIncorrectlyParsedFactsRule = makeRule({
    conditions: [() => true],
    applyEffect({ fact, dependencies }) {
        let ignoreLine = false
        if (isNaN(fact.date.getTime())) {
            ignoreLine = true
        }
        if (!dependencies.knownProviders.includes(fact.shippingProvider)) {
            ignoreLine = true
        }
        if (!dependencies.knownPackageSizes.includes(fact.packageSize)) {
            ignoreLine = true
        }

        return ignoreLine ? { ...fact, ignore: true } : fact
    },
})

export const smallShipmentLowestPriceRule = makeRule({
    conditions: [isPackageSize('S')],
    applyEffect: ({ fact, dependencies }) => {
        const { pricing } = dependencies
        const actualPrice = pricing[fact.shippingProvider][fact.packageSize]
        const minPrice = Math.min(...Object.values(pricing).map((price) => price.S))
        const discount = actualPrice - minPrice
        return { ...fact, proposedDiscount: discount === 0 ? undefined : discount }
    },
})

const largeLaPosteShipments = [isProvider('LP'), isPackageSize('L')]

export const largeLaPosteShipmentRule = makeRule({
    conditions: [...largeLaPosteShipments],
    applyEffect: ({ fact, dependencies }) => {
        const { monthMapper } = dependencies
        const dateString = dateToDateMonth(fact.date)
        const { largeShipmentCount } = monthMapper.get(dateString)
        monthMapper.set(dateString, 'largeShipmentCount', largeShipmentCount + 1)
        return fact
    },
})
export const thirdShipmentFree = makeRule({
    conditions: [...largeLaPosteShipments, isMonthlyShipmentNumber(3)],
    applyEffect: ({ fact, dependencies }) => {
        const { pricing } = dependencies
        return { ...fact, proposedDiscount: pricing[fact.shippingProvider][fact.packageSize] }
    },
})

export const applyPriceRule = makeRule({
    conditions: [onlyKnownShippingProvider()],
    applyEffect: ({ fact, dependencies }) => {
        const { pricing, monthMapper } = dependencies
        const dateString = dateToDateMonth(fact.date)
        const { accumulatedDiscount } = monthMapper.get(dateString)

        const proposedDiscount = fact.proposedDiscount ?? 0

        const accumulatedDiscountSum = proposedDiscount + accumulatedDiscount
        let price = pricing[fact.shippingProvider][fact.packageSize]
        if (accumulatedDiscountSum < dependencies.maxMonthlyDiscountThreshold) {
            monthMapper.set(dateString, 'accumulatedDiscount', accumulatedDiscount + proposedDiscount)

            return { ...fact, price: price - proposedDiscount, discount: fact.proposedDiscount }
        }
        const newProposedDiscount = Math.max(
            Number.parseFloat((dependencies.maxMonthlyDiscountThreshold - accumulatedDiscount).toPrecision(1)),
            0
        )
        monthMapper.set(dateString, 'accumulatedDiscount', accumulatedDiscount + newProposedDiscount)
        price = price - newProposedDiscount
        return { ...fact, price, discount: newProposedDiscount }
    },
})
