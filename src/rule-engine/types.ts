import { Dependencies } from '../dependencies'

export type PackageSize = 'S' | 'M' | 'L'

export type PackageProvider = 'LP' | 'MR'

export interface Fact {
    date: Date
    shippingProvider: PackageProvider
    packageSize: PackageSize
    proposedDiscount?: number
    // move away
    price?: number
    discount?: number
    ignore?: boolean
}

export type Condition = (arg?: any) => (args: { fact: Fact; dependencies: Dependencies }) => boolean
export type InitialisedCondition = ReturnType<Condition>
