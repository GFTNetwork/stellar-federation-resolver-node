class FederationRecord {
    constructor(record) {
        if (record === null || !(record instanceof FederationRecord) && typeof record !== 'object') throw new TypeError('Invalid federation record.')
        if (!record.accountId) throw new Error('Invalid federation record, "accountId" is missing.')
        if (!record.username) throw new Error('Invalid federation record, "username" is missing.')
        //if (!record.domain) throw new TypeError('Invalid federation record, "domain" is missing.')
        this.accountId = record.accountId
        this.username = record.username
        this.domain = record.domain
        if (record.memoType) {
            if (['text', 'id', 'hash'].indexOf(record.memoType) < 0) throw new Error(`Invalid memoType: ${record.memoType}.`)
            this.memoType = record.memoType
        }
        if (record.memo) {
            if (!this.memoType) throw new Error('Parameter "memo" valid only in combination with "memoType".')
            this.memo = record.memo
        }
    }

    toJson() {
        const res = {
            stellar_address: this.domain ? `${this.username}*${this.domain}` : this.username,
            account_id: this.accountId
        }
        if (this.memo) {
            res['memo_type'] = this.memoType
            res['memo'] = this.memo
        }
        return res
    }
}

module.exports = FederationRecord