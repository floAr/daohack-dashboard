import { BigInt, ipfs, json, JSONValue, Value, ValueKind } from '@graphprotocol/graph-ts'
import {
  Transfer as TransferEvent,
  xPunks as TokenContract
} from '../generated/xPunks/xPunks'
import {
  Token, User, Attribute, AttributeValue
} from '../generated/schema'

const ipfshash = "QmaSS3Tw398Z4StpyYWcSuXV2cUq48gzrXbXcbReQDHpSi"



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
        if (attributes) {
          let attributeArray = attributes.toArray();
          let attributeValues = attributeArray.map<string>((att: JSONValue) => {
            let attribute = att.toObject()
            let trait_type = attribute.get('trait_type')
            let value = attribute.get('value')
            if (trait_type && value) {
              let av = AttributeValue.load(value.toString())
              if (!av) {
                av = new AttributeValue(value.toString())
                av.value = value.toString()
                av.trait_type = trait_type.toString()
                av.save()
              }
              return av.id;
            }
            return "";
          })
          token.attributes = attributeValues;
        }
      }
    }
  }
  token.updatedAtTimestamp = event.block.timestamp

  /* set or update the owner field and save the token to the Graph Node */
  token.owner = event.params.to.toHexString()

  token.save()
  applyAttributeMap(event, 'type', token)
  // applyAttributeMap(event, 'attribute_count', token)

}

const manipulateAttributeMap = (user: User, trait_type: string, value: string, change: BigInt): void => {
  let attr_id = user.id + '-' + trait_type + '-' + value
  let amap = Attribute.load(attr_id)
  if (!amap) {
    amap = new Attribute(attr_id)
    amap.owner = user.id
    amap.trait_type = trait_type
    amap.value = value
    amap.count = BigInt.zero()
  }

  amap.count = amap.count.plus(change)
  amap.save();
}


const applyAttributeMap = (event: TransferEvent, trait_type: string, token: Token): void => {
  /* if the user does not yet exist, create them */
  let user_to = User.load(event.params.to.toHexString())
  if (!user_to) {
    user_to = new User(event.params.to.toHexString())
    user_to.save()
  }
  let value = token.getString(trait_type)
  manipulateAttributeMap(user_to, trait_type, value, BigInt.fromI32(1))

  let user_from = User.load(event.params.from.toHexString())
  if (!user_from) {
    user_from = new User(event.params.from.toHexString())
    user_from.save()
  }
  manipulateAttributeMap(user_from, trait_type, value, BigInt.fromI32(-1))
}



