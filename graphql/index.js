const { gql } = require('apollo-server-express');

const baseSchema = gql`
  scalar BigInt

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type Query {
    version(ts: BigInt): String @cacheControl(maxAge: 60)
  }

  type Mutation {
    base: String
  }
`;

const baseResolver = {
  Query: {
    async version(_, args, context) {
      console.log('==> accessing version');

      return '1.0.0';
    },
  },
  Mutation: {
    async base(_, args) {
      console.log('==> accessing base');

      return 'Base';
    },
  },
};

const schemas = [baseSchema];

const resolvers = [baseResolver];

module.exports = {
  typeDefs: schemas,
  resolvers,
};
