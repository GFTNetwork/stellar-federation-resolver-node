# Stellar Federation resolver for NodeJS

NodeJS implementation of the [Stellar Federation protocol](https://www.stellar.org/developers/guides/concepts/federation.html). Modular, framework-agnostic, with multi-database support.

## Features

* Integrates with any web framework (Express, Sails, Koa, Hapi, etc).
* Minimalistic configuration.
* Flexible federation requests handling.
* Extendable via custom providers mechanism.

## Installation
`$ npm i stellar-federation-resolver-node`

## Configuration

Minimal configuration

```
const FederationResolver = require('stellar-federation-resolver-node')

const resolver = new FederationResolver({
    domains: '*' // allow all domains
})
```

### All configuration options

```
{
    domains: 'foo.com,bar.net',       // list of domains available for lookup
    provider: myCustomResolver,       // custom federation provider (optional)
    resolveByName: nameResolver,      // callback for name request resolution (optional)
    resolveById: idResolver,          // callback for id request resolution (optional)
    resolveByForward: forwardResolver,// callback for forward request resolution (optional)
    horizon: 'https://my.horizon'     // URL of horizon server for txid lookups (optional)
}
```

In case if you don't specify the resolution callback for any request type, the resolver will return an error for that particular type.

Parameter `horizon` is required only for `txid` lookup. You can safely omit it if you don't plan to allow `txid` requests.

## Usage examples

Assume we have database with table User and some basic set of parameters.

```
{
    "id": 83475301,
    "name": "Tunde",
    "lastName": "Adebayo",
    "userNicname": "tunde_adebayo",
    "domain": "foo.com",
    "stellarAccount": "GAIGZHHWK3REZQPLQX5DNUN4A32CSEONTU6CMDBO7GDWLPSXZDSYA4BK"
}
```


### Resolution

Resolution callbacks can be defined using one of the following signatures:

With callback function (Sequelize ORM is used here):
```
resolveByName: (searchParams, cb) => {
    User.findOne({
        where: {
            userNicname: searchParams.query,
            domain: searchParams.domain
        }
    })
    .catch(err => cb(err))
    .then(user => cb(null, {
        username: user.userNicname,
        accountId: user.stellarAccount
    }))
}
```

With promise (on the example of Mongoose ORM):
```
resolveByName: (searchParams) => {
    return User.findOne({
        userNicname: searchParams.query,
        domain: searchParams.domain
    })
    .exec()
    .then(user => {
        username: user.userNicname,
        accountId: user.stellarAccount
    })
}
```


Resolver callbacks expect to receive an object with standard set of fields:

```
{
    username: 'username', // unique username
    domain: 'foo.com',    // domain used for resolution
    memo: '4523452345',   // (optional) data you want associate with user
    memoType: 'text',     // (optional) data type, one of ['text', 'id', 'hash']
}
```

The "memo" field can be used to track third-party system transactions.

```
resolveById: (searchParams) => {
    return User.findOne({
        where: {
            stellarAccount: searchParams.query,
            domain: searchParams.domain
        }
    })
    .then(user => {
        username: user.userNicname,
        accountId: user.stellarAccount,
        memoType: 'text',
        memo: user.id
    })
}
```

### ExpressJS example

```
var express = require('express')
// create and configure the express instance
var app = express()
...

var FederationResolver = require('stellar-federation-resolver-node')

//create federation resolver
var resolver = new FederationResolver({
    domains: 'my.domain.com',
    resolveByName: (searchParams) => {
        //your implementation here
    }
    resolveById: (searchParams) => {
        //your implementation here
    }
})

//and use it along with middleware
app.get('/federation', (req, res, next) => {
    //allow cross-domain requests
    res.header("Access-Control-Allow-Origin", "*")
    //pass query params to resolver
    resolver.resolve(req.query)
        //errors are handled by the global error handler
        .catch(err => next(err))
        //and return JSON if everything ok
        .then(record => res.json(record))
})

// error handler
app.use((err, req, res, next) => {
    console.error(err) //log errors
    if (err.status) {
        //detailed error message with specific status code
        return res.status(err.status).json({
            detail: err.message
        })
    }
    //handle generic errors
    res.status(500).json({
        detail: 'Internal server error'
    })
})
```

## Contribution

Project repository: https://github.com/GFTNetwork/stellar-federation-resolver-node
Issue tracker: https://github.com/GFTNetwork/stellar-federation-resolver-node/issues

### Tests

npm test

### How can I help

Primary tasks:

1. Create providers with simplistic configuration for Sequelize and Mongoose ORMs (see [Go implementation](https://github.com/stellar/go/tree/master/services/federation)).
2. Implement `forward` requests.
3. Add examples for usage with other web-frameworks.

## License

(The MIT License)

Copyright (c) 2017 GFT Network &lt;astro@gft.network&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
