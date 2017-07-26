const chai = require('chai'),
    expect = chai.expect,
    Config = require('../src/config')

describe('Config', function () {
    describe('#constructor', function () {
        it('should fail without configuration object', function () {
            expect(() => new Config()).to.throw('Invalid configuration object provided.')
        })

        it('should fail without explicit domain declaration', function () {
            expect(() => new Config({})).to.throw('Invalid configuration property: "domains". Please provide a list of allowed domains or wildcard("*") for unrestricted lookup.')
        })

        it('should support domain list', function () {
            const domains = ['d1.com', 'd2.com']
            let config = new Config({domains})
            expect(config.domains).to.have.same.members(domains)
            config = new Config({domains: 'd1.com,d2.com'})
            expect(config.domains).to.have.same.members(domains)
        })

        it('should support wildcard in domain list', function () {
            const config = new Config({domains:'*'})
            expect(config.domains).to.be.null
        })
    })
})

