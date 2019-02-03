# apollo-link-optimistic

[![npm version](https://badge.fury.io/js/apollo-link-optimistic.svg)](https://badge.fury.io/js/apollo-link-optimistic)
[![Build Status](https://travis-ci.org/helfer/apollo-link-optimistic.svg?branch=master)](https://travis-ci.org/helfer/apollo-link-optimistic)
[![codecov](https://codecov.io/gh/helfer/apollo-link-optimistic/branch/master/graph/badge.svg)](https://codecov.io/gh/helfer/apollo-link-optimistic)

An Apollo Link that immediately returns an optimistic response provided in the context of the request, before returning the server response(s).

This link is useful if you're using Apollo Link without Apollo Client. If you're using Apollo Client, you can use Apollo Client's built-in optimistic responses. 

### Install

```sh
npm install apollo-link-optimistic
```

or

```
yarn add apollo-link-optimsitic
```

### Usage

```js
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { RetryLink } from 'apollo-link-retry';
import gql from 'graphql-tag';

import OptimisticLink from 'apollo-link-optimistic';

this.link = ApolloLink.from([
    new OptimisticLink(),
    new HttpLink({ uri: URI_TO_YOUR_GRAPHQL_SERVER }),
]);

const optimisticResponse = {
    data: {
        hello: 'Optimistic World',
    },
};

const op = {
    query: gql`{ hello }`,
    context: {
        // OptimisticLink gets the optimistic response from the context.
        optimisticResponse,
    },
};

link.execute(op).subscribe({
    next(response) { console.log(response.data.hello); },
    complete() { console.log('complete!'); },
});

// Assuming the server responds with { data: { hello: "Server World" } }
// This code will output:
// "Optimistic World"
// "Server World"
// "complete!"
```
