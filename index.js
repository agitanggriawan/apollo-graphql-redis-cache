const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginCacheControl,
} = require('apollo-server-core');
const express = require('express');
const http = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// REDIS CACHE
const responseCachePlugin = require('apollo-server-plugin-response-cache');
const { BaseRedisCache } = require('apollo-server-cache-redis');
const Redis = require('ioredis');

const { typeDefs, resolvers } = require('./graphql');

const PORT = 4001;

const startApolloServer = async (typeDefs, resolvers) => {
  const app = express();
  const httpServer = http.createServer(app);
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    cors: true,
    cache: new BaseRedisCache({
      client: new Redis({
        host: 'localhost',
        port: 6379,
        password: '',
        db: 0,
      }),
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginCacheControl({ calculateHttpHeaders: true }),
      responseCachePlugin.default(),
    ],
  });

  await server.start();
  // app.use(graphqlUploadExpress());
  // app.use(express.static(path.join(__dirname, 'public')));

  server.applyMiddleware({
    app,
    path: '/',
    cors: true,
    uploads: {
      maxFileSize: 2000,
      maxFiles: 5,
    },
  });
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
};

startApolloServer(typeDefs, resolvers);
