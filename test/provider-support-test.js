const chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    Server = require('../src/index')

chai.use(chaiAsPromised)

describe('FederationResolver + provider', function () {
    describe('#resolve', function () {
        it('should use provider methods for name resolution if provider parameter set', function () {
            const fakeProvider = {
                resolveByName: function (searchParams, cb) {
                    cb(null, {username: 'u1', accountId: '123'})
                }
            }

            const server = new Server({
                domains: '*',
                provider: fakeProvider
            })
            return expect(server.resolve({q: 'u1', type: 'name'})).eventually.deep.equal({
                stellar_address: 'u1',
                account_id: '123'
            })

        })
    })
})