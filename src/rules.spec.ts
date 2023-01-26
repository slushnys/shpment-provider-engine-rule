import { Dependencies, dependencies, monthMapper } from './dependencies'
import { Fact } from './rule-engine/types'
import { dateToDateMonth } from './rule-engine/utils'
import {
    applyPriceRule,
    ignoreIncorrectlyParsedFactsRule,
    largeLaPosteShipmentRule,
    smallShipmentLowestPriceRule,
    thirdShipmentFree,
} from './rules'

describe('rules', () => {
    describe('ignoreIncorrectlyParsedFactsRule', () => {
        it('should ignore facts with invalid date', () => {
            const fact = {
                date: new Date('invalid date'),
                shippingProvider: 'LP',
                packageSize: 'M',
            }

            const updatedFact = ignoreIncorrectlyParsedFactsRule({ fact: fact as Fact, dependencies })

            expect(updatedFact.ignore).toBe(true)
        })

        it('should ignore facts with unknown shipping provider', () => {
            const fact = {
                date: new Date(),
                shippingProvider: 'Unknown',
                packageSize: 'M',
            }

            const updatedFact = ignoreIncorrectlyParsedFactsRule({ fact: fact as Fact, dependencies })

            expect(updatedFact.ignore).toBe(true)
        })

        it('should ignore facts with unknown package size', () => {
            const fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'Unknown',
            }

            const updatedFact = ignoreIncorrectlyParsedFactsRule({ fact: fact as Fact, dependencies })

            expect(updatedFact.ignore).toBe(true)
        })

        it('should not ignore facts with valid date, shipping provider and package size', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            }

            const updatedFact = ignoreIncorrectlyParsedFactsRule({ fact, dependencies })

            expect(updatedFact.ignore).toBe(undefined)
        })
    })

    describe('smallShipmentLowestPriceRule', () => {
        it('should apply a discount if the price is not the lowest among small shipments', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'MR',
                packageSize: 'S',
            }

            const updatedFact = smallShipmentLowestPriceRule({ fact, dependencies })

            expect(updatedFact.proposedDiscount).toBe(0.5)
        })

        it('should not apply a discount if the price is the lowest among small shipments', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'S',
            }

            const updatedFact = smallShipmentLowestPriceRule({ fact, dependencies })

            expect(updatedFact.proposedDiscount).toBeUndefined()
        })

        it('should not apply a discount if the package size is not small', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            }

            const updatedFact = smallShipmentLowestPriceRule({ fact, dependencies })

            expect(updatedFact.proposedDiscount).toBeUndefined()
        })
    })

    describe('largeLaPosteShipmentRule', () => {
        let newDependencies: Dependencies
        beforeEach(() => {
            newDependencies = { ...dependencies, monthMapper: monthMapper() }
        })
        it('should increase the count of large shipments for La Poste', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'L',
            }
            largeLaPosteShipmentRule({ fact, dependencies: newDependencies })
            expect(newDependencies.monthMapper.get(dateToDateMonth(fact.date)).largeShipmentCount).toBe(1)
        })
        it('should not increase the count of large shipments if the provider is not La Poste', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'MR',
                packageSize: 'L',
            }
            largeLaPosteShipmentRule({ fact, dependencies: newDependencies })
            expect(newDependencies.monthMapper.get(dateToDateMonth(fact.date)).largeShipmentCount).toBe(0)
        })
        it('should not increase the count of large shipments if the package size is not L', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            }
            largeLaPosteShipmentRule({ fact, dependencies: newDependencies })
            expect(newDependencies.monthMapper.get(dateToDateMonth(fact.date)).largeShipmentCount).toBe(0)
        })
    })

    describe('thirdShipmentFree', () => {
        it('should apply a discount equal to the shipment price if it is the third shipment of the month and package is Large and provider is La Poste', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'L',
            }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(new Date()), 'largeShipmentCount', 3)
            const newDependencies = { ...dependencies, monthMapper: newMonthMapper }
            const updatedFact = thirdShipmentFree({ fact, dependencies: newDependencies })
            expect(updatedFact.proposedDiscount).toBe(6.9)
        })

        it('should not apply a discount if it is not the third shipment of the month', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'L',
            }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(new Date()), 'largeShipmentCount', 2)
            const newDependencies = { ...dependencies, monthMapper: newMonthMapper }
            const updatedFact = thirdShipmentFree({ fact, dependencies: newDependencies })
            expect(updatedFact.proposedDiscount).toBeUndefined()
        })

        it('should not apply a discount if package is not large', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(new Date()), 'largeShipmentCount', 3)
            const newDependencies = { ...dependencies, monthMapper: newMonthMapper }
            const updatedFact = thirdShipmentFree({ fact, dependencies: newDependencies })
            expect(updatedFact.proposedDiscount).toBeUndefined()
        })

        it('should not apply a discount if the provider is not La Poste', () => {
            const fact: Fact = {
                date: new Date(),
                shippingProvider: 'MR',
                packageSize: 'L',
            }
            const newMonthMapper = monthMapper()
            newMonthMapper.set(dateToDateMonth(new Date()), 'largeShipmentCount', 3)
            const newDependencies = { ...dependencies, monthMapper: newMonthMapper }
            const updatedFact = thirdShipmentFree({ fact, dependencies: newDependencies })
            expect(updatedFact.proposedDiscount).toBeUndefined()
        })
    })

    describe('applyPriceRule', () => {
        it('should apply the discount and update accumulated discount for the date', () => {
            const date = new Date('2022-01-01')
            const fact: Fact = {
                date,
                shippingProvider: 'MR',
                packageSize: 'M',
                proposedDiscount: 1,
            }

            const updatedFact = applyPriceRule({ fact, dependencies })

            expect(updatedFact).toEqual({
                date,
                shippingProvider: 'MR',
                packageSize: 'M',
                proposedDiscount: 1,
                price: 2,
                discount: 1,
            })
            const { accumulatedDiscount } = dependencies.monthMapper.get(dateToDateMonth(date))
            expect(accumulatedDiscount).toEqual(1)
        })

        it('should not exceed the discount max threshold', () => {
            const date = new Date('2022-01-02')
            const fact: Fact = {
                date,
                shippingProvider: 'MR',
                packageSize: 'L',
                proposedDiscount: 2,
            }

            dependencies.monthMapper.set(dateToDateMonth(date), 'accumulatedDiscount', 9.5)
            const updatedFact = applyPriceRule({ fact, dependencies })

            expect(updatedFact).toEqual({
                date,
                shippingProvider: 'MR',
                packageSize: 'L',
                proposedDiscount: 2,
                price: 3.5,
                discount: 0.5,
            })
            const { accumulatedDiscount } = dependencies.monthMapper.get(dateToDateMonth(date))
            expect(accumulatedDiscount).toEqual(10)
        })
        it('should not apply discount if it exceeds the max threshold', () => {
            const date = new Date('2022-01-02')
            const fact: Fact = {
                date,
                shippingProvider: 'MR',
                packageSize: 'L',
                proposedDiscount: 2,
            }

            dependencies.monthMapper.set(dateToDateMonth(date), 'accumulatedDiscount', 11)
            const updatedFact = applyPriceRule({ fact, dependencies })

            expect(updatedFact).toEqual({
                date,
                shippingProvider: 'MR',
                packageSize: 'L',
                proposedDiscount: 2,
                price: 4,
                discount: 0,
            })
        })
    })
})
