const chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    proxyquire = require('proxyquire'),
    StellarSdk = require('stellar-sdk')

chai.use(chaiAsPromised)

const testKeyPair = StellarSdk.Keypair.random()

class HorizonStub {
    constructor(horizonServer) {
        this.horizonServer = horizonServer
    }

    transactions() {
        return {
            transaction: txid => {
                return {
                    call: () => Promise.resolve({account: testKeyPair.publicKey()})
                }
            }
        }
    }
}

const StellarSdkStub = {
    Server: HorizonStub,
    '@global': true
}

const FederationServer = proxyquire('../src/index', {'stellar-sdk': StellarSdkStub})

describe('FederationResolver', function () {
    describe('#resolve', function () {
        describe('[txid]', function () {
            it('should resolve transaction using Stellar horizon server', function () {
                let resolver = new FederationServer({
                    horizon: 'horizon_url',
                    domains: '*',
                    resolveById: searchParams => Promise.resolve({username: 'unknown', accountId: searchParams.query})
                })
                return expect(resolver.resolve({q: '123', type: 'txid'})).eventually.deep.equal({
                    stellar_address: 'unknown',
                    account_id: testKeyPair.publicKey()
                })
            })

            it('should require Stellar horizon server url', function () {
                let resolver = new FederationServer({
                    domains: '*'
                })
                return expect(() => resolver.resolve({
                    q: '123',
                    type: 'txid'
                })).to.throw('Horizon server URL is not specified. Provide "horizon" configuration parameter.')
            })
        })

        describe('[name]', function () {
            it('should resolve username without domain', function () {
                let resolver = new FederationServer({
                    domains: '*',
                    resolveByName: searchParams => Promise.resolve({username: searchParams.query, accountId: '123'})
                })
                return expect(resolver.resolve({q: 'u1', type: 'name'})).eventually.deep.equal({
                    stellar_address: 'u1',
                    account_id: '123'
                })
            })

            it('should resolve username with domain', function () {
                let resolver = new FederationServer({
                    domains: '*',
                    resolveByName: searchParams => Promise.resolve({
                        username: searchParams.query,
                        domain: searchParams.domain,
                        accountId: '123'
                    })
                })
                return expect(resolver.resolve({q: 'u1*domain.com', type: 'name'})).eventually.deep.equal({
                    stellar_address: 'u1*domain.com',
                    account_id: '123'
                })
            })
        })

        describe('[id]', function () {
            it('should resolve id without domain', function () {
                let resolver = new FederationServer({
                    domains: '*',
                    resolveById: searchParams => Promise.resolve({username: searchParams.query, accountId: searchParams.query})
                })
                return expect(resolver.resolve({q: testKeyPair.publicKey(), type: 'id'})).eventually.deep.equal({
                    stellar_address: testKeyPair.publicKey(),
                    account_id: testKeyPair.publicKey()
                })
            })

            it('should resolve id with domain', function () {
                let resolver = new FederationServer({
                    domains: '*',
                    resolveById: searchParams => Promise.resolve({
                        username: searchParams.query,
                        domain: searchParams.domain,
                        accountId: searchParams.query
                    })
                })

                return expect(resolver.resolve({q: testKeyPair.publicKey()+'*domain.com', type: 'id'})).eventually.deep.equal({
                    stellar_address: testKeyPair.publicKey()+'*domain.com',
                    account_id: testKeyPair.publicKey()
                })
            })
        })
        describe('[forward]', function () {
            it('should forward request to external app')
        })
    })
})