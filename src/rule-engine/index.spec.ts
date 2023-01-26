import { makeRuleEngine } from './'

import { Rule, makeRule } from './rule'
import { Fact } from './types'

import { dependencies } from '../dependencies'

describe('makeRuleEngine', () => {
    it('should apply all rules to the facts', () => {
        const facts: Fact[] = [
            {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            },
            {
                date: new Date(),
                shippingProvider: 'MR',
                packageSize: 'S',
            },
        ]

        const rules: Rule[] = [
            makeRule({
                conditions: [(args) => args.fact.date.getFullYear() === new Date().getFullYear()],
                applyEffect: (args) => {
                    return {
                        ...args.fact,
                        proposedDiscount: 10,
                    }
                },
            }),
            makeRule({
                conditions: [(args) => args.fact.shippingProvider === 'LP'],
                applyEffect: (args) => {
                    return {
                        ...args.fact,
                        discount: 5,
                    }
                },
            }),
        ]

        const ruleEngine = makeRuleEngine({ rules, dependencies })
        const updatedFacts = ruleEngine.run(facts)

        expect(updatedFacts[0].proposedDiscount).toBe(10)
        expect(updatedFacts[0].discount).toBe(5)
        expect(updatedFacts[1].proposedDiscount).toBe(10)
        expect(updatedFacts[1].discount).toBeUndefined()
    })

    it('should add and remove rules', () => {
        const facts: Fact[] = [
            {
                date: new Date(),
                shippingProvider: 'LP',
                packageSize: 'M',
            },
        ]

        const rules: Rule[] = [
            makeRule({
                conditions: [(args) => args.fact.date.getFullYear() === new Date().getFullYear()],
                applyEffect: (args) => {
                    return {
                        ...args.fact,
                        proposedDiscount: 10,
                    }
                },
            }),
        ]

        const ruleEngine = makeRuleEngine({ rules, dependencies })
        let updatedFacts = ruleEngine.run(facts)

        expect(updatedFacts[0].proposedDiscount).toBe(10)
        const LaPosteGetsDiscountRule = makeRule({
            conditions: [(args) => args.fact.shippingProvider === 'LP'],
            applyEffect: (args) => {
                return {
                    ...args.fact,
                    discount: 5,
                }
            },
        })
        ruleEngine.addRule(LaPosteGetsDiscountRule)
        updatedFacts = ruleEngine.run(facts)

        expect(updatedFacts[0].proposedDiscount).toBe(10)
        expect(updatedFacts[0].discount).toBe(5)

        ruleEngine.removeRule(LaPosteGetsDiscountRule)
        updatedFacts = ruleEngine.run(facts)

        expect(updatedFacts[0].proposedDiscount).toBe(10)
        expect(updatedFacts[0].discount).toBeUndefined()
    })
})
