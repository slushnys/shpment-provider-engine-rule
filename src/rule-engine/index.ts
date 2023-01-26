import { Fact } from './types'
import { Rule } from './rule'

import { Dependencies } from '../dependencies'

export const makeRuleEngine = ({ rules, dependencies }: { rules: Rule[]; dependencies: Dependencies }) => {
    let initialisedRules = rules

    function addRule(rule) {
        initialisedRules = [...initialisedRules, rule]
    }
    function removeRule(rule) {
        initialisedRules = initialisedRules.filter((existingRule) => existingRule !== rule)
    }
    function run(facts: Fact[]) {
        return facts.map((fact) =>
            initialisedRules.reduce((fact, parseRule) => parseRule({ fact, dependencies }), fact)
        )
    }
    return {
        run,
        addRule,
        removeRule,
    }
}
