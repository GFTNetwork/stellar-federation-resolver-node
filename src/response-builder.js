const Record = require('./record')

class ResponseBuilder {
    serialize(rawResult){
        if (rawResult) return Promise.resolve(new Record(rawResult).toJson())
        return this.notFound()
    }

    notFound() {
        const err = new Error(`Not found.`)
        err.status = 404
        return this.error(err)
    }

    forbiddenRequestType(requestType) {
        const err = new Error(`Request type "${requestType}" is not supported.`)
        err.status = 501
        return this.error(err)
    }

    invalidParam(param, errorMessage, status) {
        let message = errorMessage ?
            `Invalid "${param}" parameter value. ${errorMessage}` :
            `Parameter "${param}" is required.`
        const err = new Error(message)
        err.status = status || 400
        return this.error(err)
    }

    error(err, status) {
        if (!(err instanceof Error)) {
            err = new Error('Internal error')
        }
        err.status = status || err.status || 500
        return Promise.reject(err)
    }
}

module.exports = new ResponseBuilder()