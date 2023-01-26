import {
    isPackageSize,
    isProvider,
    isMonthlyShipmentNumber,
    onlyKnownShippingProvider,
    isAllowedToGiveDiscount,
} from './conditions'
import { dependencies, monthMapper } from './dependencies'
import { Fact } from './rule-engine/types'
import { dateToDateMonth } from './rule-engine/utils'

describe('conditions', () => {
    describe('isPackageSize', () => {
        it('returns true for package size match', () => {
            const fact = { packageSize: 'S' }
            const condition = isPackageSize('S')
            expect(condition({ fact: fact as Fact, dependencies })).toBe(true)
        })

        it('returns false for package size mismatch', () => {
            const fact = { packageSize: 'M' }
            const condition = isPackageSize('S')
            expect(condition({ fact: fact as Fact, dependencies })).toBe(false)
        })
    })
    describe('isProvider', () => {
        it("should return true if the fact's shippingProvider matches the provided provider", () => {
            const fact = { shippingProvider: 'LP' }
            const result = isProvider('LP')({ fact: fact as Fact, dependencies })
            expect(result).toBe(true)
        })

        it("should return false if the fact's shippingProvider does not match the provided provider", () => {
            const fact = { shippingProvider: 'LP' }
            const result = isProvider('MR')({ fact: fact as Fact, dependencies })
            expect(result).toBe(false)
        })
    })

    describe('isMonthlyShipmentNumber', () => {
        const date = new Date('2023-01-01')
        const fact = {
            date,
            shippingProvider: 'La Poste',
            packageSize: 'L',
        }

        it('returns true when monthly large shipment count equals provided count', () => {
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(date), 'largeShipmentCount', 3)
            const isThirdShipment = isMonthlyShipmentNumber(3)({
                fact: fact as Fact,
                dependencies: { ...dependencies, monthMapper: newMonthMapper },
            })
            expect(isThirdShipment).toBe(true)
        })

        it('returns false when monthly large shipment count does not equal provided count', () => {
            const isEqual = isMonthlyShipmentNumber(2)({ fact: fact as Fact, dependencies })
            expect(isEqual).toBe(false)
        })
    })

    describe('isAllowedToGiveDiscount', () => {
        const discountLimit = 10
        const date = new Date()
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should return true if the accumulated discount is less than the discount limit', () => {
            const fact = { date }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(date), 'accumulatedDiscount', 5)
            expect(
                isAllowedToGiveDiscount(discountLimit)({
                    fact: fact as Fact,
                    dependencies: { ...dependencies, monthMapper: newMonthMapper },
                })
            ).toBe(true)
        })

        it('should return false if the accumulated discount is equal to the discount limit', () => {
            const fact = { date }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(date), 'accumulatedDiscount', 10)
            expect(
                isAllowedToGiveDiscount(discountLimit)({
                    fact: fact as Fact,
                    dependencies: { ...dependencies, monthMapper: newMonthMapper },
                })
            ).toBe(false)
        })

        it('should return false if the accumulated discount is greater than the discount limit', () => {
            const fact = { date }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(date), 'accumulatedDiscount', 11)
            expect(
                isAllowedToGiveDiscount(discountLimit)({
                    fact: fact as Fact,
                    dependencies: { ...dependencies, monthMapper: newMonthMapper },
                })
            ).toBe(false)
        })
    })

    describe('onlyKnownShippingProvider', () => {
        it('should return true if the shipping provider is in the list of known providers', () => {
            const fact = { shippingProvider: 'LP' }
            expect(onlyKnownShippingProvider()({ fact: fact as Fact, dependencies })).toBe(true)
        })

        it('should return false if the shipping provider is not in the list of known providers', () => {
            const fact = { shippingProvider: 'DHL' }
            expect(onlyKnownShippingProvider()({ fact: fact as Fact, dependencies })).toBe(false)
        })

        it('should return false if the shipping provider property is not present in fact', () => {
            const fact = {}
            expect(onlyKnownShippingProvider()({ fact: fact as Fact, dependencies })).toBe(false)
        })
    })
})
