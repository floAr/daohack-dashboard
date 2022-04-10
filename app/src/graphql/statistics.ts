const getWeights = (address: string) => `
{
    users(where:{id:"${address}"}) {
      id
      attributeMap(orderBy:count){value
      count}
    }
  }
  `
export interface Trait {
    value: string
    weight: number
    weight_normalized: number
}
interface VoterWeight {
    traits: Trait[]
}

export const fetchVoterWeight = async (address: string): Promise<VoterWeight> => {
    const response = await fetch('https://api.thegraph.com/subgraphs/name/floar/xpunks-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: getWeights(address.toLowerCase()) }),
    });
    const data = await response.json();
    // console.log(data)
    const traits: {value:string,count:string}[] = data.data.users[0].attributeMap
    const weights = traits.map(trait => {
        return {
            value: trait.value,          
            weight: parseInt(trait.count),
            weight_normalized: parseInt(trait.count)
        }
    })
    return { traits: weights }
}