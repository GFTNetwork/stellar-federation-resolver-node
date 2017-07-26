const chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    responseBuilder = require('../src/response-builder')

chai.use(chaiAsPromised)

describe('ResponseBuilder', function () {
    describe('#serialize', function () {
        it('should return 404 on empty result', function () {
            return expect(responseBuilder.serialize(null)).to.be.rejected.and.eventually.have.property('status', 404)
        })
        it('should serialize valid record', function () {
            return expect(responseBuilder.serialize({accountId: '123', username: 'n'})).to.eventually.have.property('account_id', '123')
        })
    })

    describe('#notFound', function () {
        it('should return 404 on notFound call', function () {
            return expect(responseBuilder.notFound()).to.be.rejected.and.eventually.have.property('status', 404)
        })
    })

    describe('#forbiddenRequestType', function () {
        it('should return 501 on forbiddenRequestType call', function () {
            return expect(responseBuilder.forbiddenRequestType('?')).to.be.rejectedWith('Request type "?" is not supported.').and.eventually.have.property('status', 501)
        })
    })

    describe('#error', function () {
        it('should return an error and set response status with Error object', function () {
            return expect(responseBuilder.error(new Error('error!'), 555)).to.be.rejectedWith('error!').and.eventually.have.property('status', 555)
        })

        it('should return a generic error with custom object', function () {
            return expect(responseBuilder.error('error')).to.be.rejectedWith('Internal error').and.eventually.have.property('status', 500)
        })
    })
})