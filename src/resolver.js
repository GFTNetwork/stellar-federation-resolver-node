const Config = require('./config'),
    stellarBase = require('stellar-base'),
    StellarSdk = require('stellar-sdk'),
    responseBuilder = require('./response-builder')

class FederationResolver {
    constructor(config) {
        if (!(config instanceof Config)) throw new TypeError('Invalid argument. FederationServerConfig instance expected.')
        this.config = config
    }

    resolveByName(params) {
        return this.retrieveSearchParameters(params)
            .then(searchParams => {
                if (!searchParams) return responseBuilder.notFound()
                return this.invokeResolverRequest('Name', searchParams)
            })
    }

    resolveById(params) {
        return this.retrieveSearchParameters(params)
            .then(searchParams => {
                if (!searchParams) {
                    return responseBuilder.notFound()
                }
                if (!searchParams.query || !stellarBase.StrKey.isValidEd25519PublicKey(searchParams.query)) {
                    return responseBuilder.invalidParam('q', `Invalid Stellar account id: ${searchParams.query}.`)
                }
                return this.invokeResolverRequest('Id', searchParams)
            })
    }

    resolveByTx(params) {
        if (!this.config.horizon) throw new Error('Horizon server URL is not specified. Provide "horizon" configuration parameter.')

        return this.retrieveSearchParameters(params)
            .then(searchParams => {
                if (!searchParams) return responseBuilder.notFound()
                const horizon = new StellarSdk.Server(this.config.horizon)

                return horizon
                    .transactions()
                    .transaction(searchParams.query)
                    .call()
                    .then(transactionResult => {
                        return this.resolveById({q: transactionResult.account})
                    })
            })
    }

    resolveByForward(params) {
        return this.invokeResolverRequest('Forward', params)
    }

    isDomainAllowed(domainName) {
        return this.config.domains === null || (typeof(domainName) === 'string' && this.config.domains.indexOf(domainName.toLowerCase()) >= 0)
    }

    retrieveSearchParameters(params) {
        if (!params.q) return responseBuilder.invalidParam('q')
        const nameParts = ('' + params.q).split('*')

        if (nameParts.length !== 1) {
            if (nameParts.length === 2) {
                if (!this.isDomainAllowed(nameParts[1])) {
                    return responseBuilder.invalidParam('q', `Queries not allowed for domain ${nameParts[1]}.`, 403)
                }
            }
            else {
                return responseBuilder.invalidParam('q', `Invalid query format: ${params.q}. Please refer to https://www.stellar.org/developers/guides/concepts/federation.html#federation-requests`)
            }
        }

        const query = nameParts[0].replace('[\<\*,\>]', '')
        if (!query) return responseBuilder.invalidParam('q', `Invalid lookup query: ${query}.`)

        return Promise.resolve({
            query: query,
            domain: nameParts[1]
        })
    }

    invokeResolverRequest(resolverType, data) {
        const resolverMethod = this.config.getResolverCallback(resolverType)
        return new Promise((resolve, reject) => {
            if (!resolverMethod) return responseBuilder.forbiddenRequestType(resolverType).catch(err => reject(err))

            const cb = (err, res) => {
                if (err) return reject(err)
                resolve(res)
            }

            //invoke resolver method
            let res = resolverMethod(data, cb)

            //check if execution result is a promise
            if (typeof res.then === 'function') return res.then(record => resolve(record)).catch(err => reject(err))
        })
    }
}

module.exports = FederationResolver