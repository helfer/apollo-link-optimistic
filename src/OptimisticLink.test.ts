import OptimisticLink from './OptimisticLink';
import {
    execute,
    GraphQLRequest,
    ApolloLink,
    Operation,
    Observable,
} from 'apollo-link';
import {
    ExecutionResult,
} from 'graphql';
import gql from 'graphql-tag';
import { TestLink, assertObservableSequence } from './TestUtils';

describe('OptimisticLink', () => {
    let link: ApolloLink;
    let testLink: TestLink;

    const optimisticResponse = {
        data: {
            hello: 'Optimism',
        },
    };
    const testResponse = {
        data: {
            hello: 'World',
        },
    };

    const op: GraphQLRequest = {
        query: gql`{ hello }`,
        context: {
            optimisticResponse,
            testResponse,
        },
    };

    beforeEach(() => {
        jest.useFakeTimers();
        testLink = new TestLink();
        link = ApolloLink.from([new OptimisticLink(), testLink]);
    });

    it('forwards the operation', () => {
        return new Promise((resolve, reject) => {
            execute(link, op).subscribe({
                next: (data) => undefined,
                error: (error) => reject(error),
                complete: () => {
                    expect(testLink.operations.length).toBe(1);
                    expect(testLink.operations[0].query).toEqual(op.query);
                    resolve();
                },
            });
            jest.runAllTimers();
        });
    });
    it('returns the optimistic response before the real response', () => {
        return assertObservableSequence(
            execute(link, op),
            [
                { type: 'next', value: optimisticResponse },
                { type: 'next', value: testResponse },
                { type: 'complete' },
            ],
            () => jest.runAllTimers(),
        );
    });
    it('just forwards if context.optimisticResponse is not defined', () => {
        const nonOptimisticOp = {
            query: op.query,
            context: { testResponse },
        };
        return assertObservableSequence(
            execute(link, nonOptimisticOp),
            [
                { type: 'next', value: testResponse },
                { type: 'complete' },
            ],
            () => jest.runAllTimers(),
        );
    });
    it('passes through errors', () => {
        const testError = new Error('Hello darkness my old friend');
        const opWithError: GraphQLRequest = {
            query: gql`{ hello }`,
            context: {
                optimisticResponse,
                testError,
            },
        };
        return assertObservableSequence(
            execute(link, opWithError),
            [
                { type: 'next', value: optimisticResponse },
                { type: 'error', value: testError },
            ],
            () => jest.runAllTimers(),
        );
    });
});
