import {InMemoryCache, makeVar} from '@apollo/client';

export const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          queuedSongs: {
            read() {
              return queuedSongsVar();
            }
          }
        }
      }
    }
  });

  export const queuedSongsVar = makeVar([]);