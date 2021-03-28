import { ApolloClient } from '@apollo/client';
import { cache } from './cache';


export const client = new ApolloClient({
  cache: cache,
  uri: "https://apollo-music-cmc.hasura.app/v1/graphql",
  headers: {
    'x-hasura-admin-secret': "GhA97ZY6JRfLy9yagNOnC4T0iciGQU8yuLz4qHOuHF6kWPduyZKYQWymWIcetIM5"
  }
});
  


