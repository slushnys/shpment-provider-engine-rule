import { makeRuleEngine } from './rule-engine'
import {
    smallShipmentLowestPriceRule,
    largeLaPosteShipmentRule,
    thirdShipmentFree,
    applyPriceRule,
    ignoreIncorrectlyParsedFactsRule,
} from './rules'
import { dependencies } from './dependencies'
import { makeRule } from './rule-engine/rule'

import { readFileSync } from 'fs'

function main() {
    const [, , file] = process.argv
    let parsedRecords
    try {
        parsedRecords = readFileSync(file, { encoding: 'utf-8' })
            .split('\n')
            .map((itm) => itm.split(' '))
    } catch (error) {
        console.error('Could not read the file, does it exist?', error)
        return
    }

    const engine = makeRuleEngine({
        rules: [
            ignoreIncorrectlyParsedFactsRule,
            smallShipmentLowestPriceRule,
            largeLaPosteShipmentRule,
            thirdShipmentFree,
            applyPriceRule,
        ],
        dependencies,
    })

    const facts = parsedRecords.map(([date, packageSize, shippingProvider]) => ({
        date: new Date(date),
        packageSize,
        shippingProvider,
    }))

    // "Forgot a rule to show output"
    const logToStdOutRule = makeRule({
        conditions: [() => true],
        applyEffect: ({ fact }) => {
            const date = (fact.date.toISOString() ?? '').split('T')[0]
            if (fact.ignore === true) {
                console.log(`${date} ${fact.packageSize ?? ''} ${fact.shippingProvider ?? ''} Ignored`)
                return fact
            }
            console.log(
                `${date} ${fact.packageSize} ${fact.shippingProvider} ${fact.price ?? '-'} ${fact.discount ?? '-'}`
            )
            return fact
        },
    })
    engine.addRule(logToStdOutRule)
    engine.run(facts)
}

main()
