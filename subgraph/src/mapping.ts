import { BigInt, ipfs, json, Value, ValueKind } from '@graphprotocol/graph-ts'
import {
  Transfer as TransferEvent,
  xPunks as TokenContract
} from '../generated/xPunks/xPunks'
import {
  Token, User, Attribute
} from '../generated/schema'

const ipfshash = "QmaSS3Tw398Z4StpyYWcSuXV2cUq48gzrXbXcbReQDHpSi"
const type_name = "type"

const manipulateAttributeMap = (user: User, trait_type: string, value: string, change: BigInt): void => {
  let attr_id = user.id + '-' + trait_type + '-' + value
  let amap = Attribute.load(attr_id)
  if (!amap) {
    amap = new Attribute(attr_id)
    amap.owner = user.id
    amap.value = value
    amap.count = BigInt.zero()
  }

  amap.count = amap.count.plus(change)
  amap.save();
}


const applyAttributeMap = (event: TransferEvent, trait_type: string, token: Token): void => {
  let value = token.getString(trait_type)
  if (value) {
    /* if the user does not yet exist, create them */
    let user_to = User.load(event.params.to.toHexString())
    if (!user_to) {
      user_to = new User(event.params.to.toHexString())
      user_to.save()
    }

    manipulateAttributeMap(user_to, trait_type, value, BigInt.fromI32(1))

    // let user_from = User.load(event.params.from.toHexString())
    // if (!user_from) {
    //   user_from = new User(event.params.from.toHexString())
    //   user_from.save()
    // }
    // manipulateAttributeMap(user_from, trait_type, value, BigInt.fromI32(-1))
  }
}



export function handleTransfer(event: TransferEvent): void {
  /* load the token from the existing Graph Node */
  let token = Token.load(event.params.tokenId.toString())
  if (!token) {
    /* if the token does not yet exist, create it */
    token = new Token(event.params.tokenId.toString())
    token.tokenID = event.params.tokenId

    token.tokenURI = "/" + event.params.tokenId.toString()

    /* combine the ipfs hash and the token ID to fetch the token metadata from IPFS */
    let metadata = ipfs.cat(ipfshash + token.tokenURI)
    if (metadata) {
      const value = json.fromBytes(metadata).toObject()
      if (value) {
        /* using the metatadata from IPFS, update the token object with the values  */
        const image = value.get('image')
        const name = value.get('name')
        const description = value.get('description')
        const externalURL = value.get('external_url')

        if (name && image && description && externalURL) {
          token.name = name.toString()
          token.image = image.toString()
          token.externalURL = externalURL.toString()
          token.description = description.toString()
          token.ipfsURI = 'ipfs.io/ipfs/' + ipfshash + token.tokenURI
        }

        const attributes = value.get('attributes')

        // THIS IS THE BETTER WAY THAT SEEMS TO BREAK
        if (attributes) {
          let attributeArray = attributes.toArray();
          for (let i = 0; i < attributeArray.length; i++) {
            let attribute = attributeArray[i].toObject()
            let trait_type = attribute.get('trait_type')
            let value = attribute.get('value')
            if (trait_type && value) {
              // remove space with _ and convert to lowercase
              let type = trait_type.toString().replace(' ', '_').toLowerCase()
              if (type == type_name)
                // This would be way cooler as it would work for all traits
                //  token.setString(type, value.toString())
                token.trait = value.toString()
            }
          }
        }
      }
    }
  }
  token.updatedAtTimestamp = event.block.timestamp

  /* set or update the owner field and save the token to the Graph Node */
  token.owner = event.params.to.toHexString()

  token.save()
  let user_to = User.load(event.params.to.toHexString())
  if (!user_to) {
    user_to = new User(event.params.to.toHexString())
    user_to.save()
  }

  let user_from = User.load(event.params.from.toHexString())
  if (!user_from) {
    user_from = new User(event.params.from.toHexString())
    user_from.save()
  }

  manipulateAttributeMap(user_to, type_name, token.trait, BigInt.fromI32(1))
  manipulateAttributeMap(user_from, type_name, token.trait, BigInt.fromI32(-1))

}






