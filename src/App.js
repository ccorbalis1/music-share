import React from 'react';
import AddSong from './components/AddSong';
import Header from './components/Header';
import SongList from './components/SongList';
import SongPlayer from './components/SongPlayer';
import { Grid, useMediaQuery, Hidden } from '@material-ui/core';
import songReducer from './reducer';

export const SongContext = React.createContext({
  song: {
    id: "bd249268-729e-4690-89b6-ebe1b20f4439",
    title: "The Mass 2 - Called out of the World",
    artist: "Bishop Robert Barron",
    thumbnail: "http://img.youtube.com/vi/0zKjnVevTzg/0.jpg",
    url: "https://youtu.be/0zKjnVevTzg",
    duration: 1386
  },
  isPlaying: false
})

function App() {
  const initialSongState = React.useContext(SongContext);
  const [state, dispatch] = React.useReducer(songReducer, initialSongState);
  
  const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up('md'));
  const greaterThanSm = useMediaQuery(theme => theme.breakpoints.up('sm'));

  return (
    <SongContext.Provider value={{ state, dispatch }}  >

      <Hidden only="xs">
        <Header />
      </Hidden>
      <Grid container spacing={3}>
        <Grid 
          style={{ 
            paddingTop: greaterThanSm ? 80 : 10 
          }}
          item 
          xs={12} 
          md={5}
        >
          <AddSong />
          <SongList />
        </Grid>
        <Grid 
          style={ greaterThanMd ?
            { 
            position: 'fixed',
            width: '100%',
            right: 0,
            top: 70
          } : {
            position: 'fixed',
            width: '100%',
            left: 0,
            bottom: 0
          }}
          item 
          xs={12} 
          md={7} 
        >
          <SongPlayer />
        </Grid>
      </Grid>
   </SongContext.Provider>
  );
}

export default App;
