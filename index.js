const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const {MONGODB} = require('./config');
const Post = require('./models/Post');
const typeDefs = require('./graphql/TypeDefs');
const resolvers = require('./graphql/resolvers/index');

const PORT = process.env.port || 5000;

const Server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => ({req})
});

mongoose.connect(MONGODB,{ useNewUrlParser:true,useUnifiedTopology: true  })
    .then(() => {
        console.log('MONGODB Connected')
        return Server.listen({port:PORT})
             
    })
    .then((res) => {
        console.log(`Server Running at ${res.url}`)
    })
    .catch((err) => console.log(err))