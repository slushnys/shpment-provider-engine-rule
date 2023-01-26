import { InitialisedCondition, Fact } from './types'

import { Dependencies } from '../dependencies'

export type Rule = ReturnType<typeof makeRule>
export function makeRule({
    conditions,
    applyEffect,
}: {
    conditions: InitialisedCondition[]
    applyEffect: (args: { fact: Fact; dependencies: Dependencies }) => Fact
}) {
    return function ({ dependencies, fact }: { fact: Fact; dependencies: Dependencies }) {
        const isPassing = !conditions
            .map((condition) => {
                return condition({ fact, dependencies })
            })
            .some((value) => !value)
        if (isPassing) {
            // if conditions pass apply effect to the fact
            return applyEffect({ fact, dependencies })
        }
        return fact
    }
}
