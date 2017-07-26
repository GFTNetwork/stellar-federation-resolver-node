class Config {
    constructor(configuration) {
        if (!configuration || typeof configuration !== 'object') throw new TypeError('Invalid configuration object provided.')

        //if (!configuration.horizon) throw new Error('Configuration property "horizon" is required.')
        this.horizon = configuration.horizon

        if (configuration.domains instanceof Array) {
            //filter all valid domains
            //TODO: check domains for TLD validity
            this.domains = configuration.domains.filter(domain => typeof domain === 'string')
        } else if (typeof configuration.domains === 'string') {
            if (configuration.domains === '*') {
                //unrestricted domain lookup
                this.domains = null
            } else {
                //list of specific domains
                //TODO: check domains for TLD validity
                this.domains = configuration.domains.split(',')
            }
        } else {
            throw new TypeError('Invalid configuration property: "domains". Please provide a list of allowed domains or wildcard("*") for unrestricted lookup.')
        }
        //TODO: use lower-cased domain names

        //copy resolution callbacks
        Config.RESOLVER_TYPES.map(this.buildResolverMethodName).forEach(key => {
            let callback = configuration[key]
            if (typeof callback === 'function') {
                this[key] = callback
            }
        })

        if (configuration.provider) {
            //validate using duck-typing
            let unsupportedMethods = Config.RESOLVER_TYPES
                .map(this.buildResolverMethodName)
                .filter(key => typeof configuration.provider[key] !== 'function')

            //if (unsupportedMethods.length) throw new TypeError(`Specified provider doesn't support the following resolution callbacks: ${unsupportedMethods.join(', ')}.`)
            if (unsupportedMethods.length === Config.RESOLVER_TYPES.length) throw new TypeError(`Specified provider doesn't support resolution callbacks.`)

            this.provider = configuration.provider
        }
    }

    getResolverCallback(resolverType) {
        if (Config.RESOLVER_TYPES.indexOf(resolverType) < 0) throw new Error(`Unsupported resolver type specified: ${resolverType}.`)
        const methodName = this.buildResolverMethodName(resolverType)
        if (this.provider) return this.provider[methodName].bind(this.provider)
        return this[methodName].bind(this)
    }

    static get RESOLVER_TYPES() {
        return ['Name', 'Id', 'Forward']
    }

    buildResolverMethodName(resolverType) {
        return 'resolveBy' + resolverType
    }
}

module.exports = Config