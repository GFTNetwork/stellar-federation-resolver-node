const chai = require('chai'),
    expect = chai.expect,
    Record = require('../src/record')

describe('Record', function () {
    describe('#constructor', function () {
        it('should fail with empty record', function () {
            expect(() => new Record()).to.throw('Invalid federation record.')
        })

        it('should fail without required parameters', function () {
            expect(() => new Record({})).to.throw('Invalid federation record, "accountId" is missing.')
            expect(() => new Record({
                accountId: '1'
            })).to.throw('Invalid federation record, "username" is missing.')
        })

        it('should validate memo type', function () {
            expect(() => new Record({
                accountId: '1',
                username: 'n',
                memoType: 'unknown'
            })).to.throw('Invalid memoType: unknown.')
        })

        it('should validate memo', function () {
            expect(() => new Record({
                accountId: '1',
                username: 'n',
                memo: '...'
            })).to.throw('Parameter "memo" valid only in combination with "memoType".')
        })
    })

    describe('#toJson', function () {
        it('should generate a valid JSON representation', function () {
            const testCases = [
                {
                    accountId: '123',
                    username: 'n',
                    expected: {
                        stellar_address: 'n',
                        account_id: '123'
                    }
                },
                {
                    accountId: '123',
                    username: 'n',
                    domain: 'd.com',
                    expected: {
                        stellar_address: 'n*d.com',
                        account_id: '123'
                    }
                },
                {
                    accountId: '123',
                    username: 'n',
                    domain: 'd.com',
                    memoType: 'text',
                    memo: 'some memo',
                    expected: {
                        stellar_address: 'n*d.com',
                        account_id: '123',
                        memo_type: 'text',
                        memo: 'some memo'
                    }
                }]

            testCases.forEach(tc => {
                let record = new Record(tc)
                expect(record.toJson()).to.deep.equal(tc.expected)
            })
        })
    })
})

