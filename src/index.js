const Config = require('./config'),
    Resolver = require('./resolver'),
    responseBuilder = require('./response-builder')

const federationRequestTypeMapping = {
    name: 'Name',
    id: 'Id',
    txid: 'Tx',
    forward: 'Forward'
}

class FederationResolver {
    constructor(config) {
        this.config = new Config(config)
        this.resolver = new Resolver(this.config)
    }

    resolve(params, cb) {
        const type = (params.type || '').toLowerCase(),
            resolverMethod = federationRequestTypeMapping[type]

        if (resolverMethod === undefined) return responseBuilder.invalidParam('type', `Unknown request type: ${params.type}.`)
        const resultPromise = this.resolver['resolveBy' + resolverMethod](params).then(res => responseBuilder.serialize(res))
        //return promise if callback was not specified
        if (typeof cb !== 'function') return resultPromise
        //bind callback to promise result
        resultPromise.then(result => cb(null, result)).catch(err => cb(err))
    }

}

module.exports = FederationResolver