import { makeRule } from './rule'
import { Fact, InitialisedCondition } from './types'

import { dependencies } from '../dependencies'

describe('makeRule', () => {
    it('should apply effect if all conditions pass', () => {
        const fact: Fact = {
            date: new Date(),
            shippingProvider: 'LP',
            packageSize: 'M',
        }

        const conditions: InitialisedCondition[] = [
            (args) => args.fact.shippingProvider === 'LP',
            (args) => args.fact.packageSize === 'M',
        ]

        const applyEffect = (args) => {
            return {
                ...args.fact,
                proposedDiscount: 10,
            }
        }

        const rule = makeRule({ conditions, applyEffect })
        const updatedFact = rule({ fact, dependencies })

        expect(updatedFact.proposedDiscount).toBe(10)
    })

    it('should not apply effect if any condition fails', () => {
        const fact: Fact = {
            date: new Date(),
            shippingProvider: 'LP',
            packageSize: 'M',
        }

        const conditions: InitialisedCondition[] = [
            (args) => args.fact.date.getFullYear() === new Date().getFullYear(),
            (args) => args.fact.shippingProvider === 'MR',
            (args) => args.fact.packageSize === 'M',
        ]

        const applyEffect = (args) => {
            return {
                ...args.fact,
                proposedDiscount: 10,
            }
        }

        const rule = makeRule({ conditions, applyEffect })
        const updatedFact = rule({ fact, dependencies })

        expect(updatedFact.proposedDiscount).toBeUndefined()
    })
})
