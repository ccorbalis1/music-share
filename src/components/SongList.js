import React from 'react';
import { 
    CircularProgress,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Typography,
    makeStyles
} from '@material-ui/core';
import { PlayArrow, Save, Pause } from '@material-ui/icons';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_SONGS } from '../grpahql/queries';
import { SongContext } from '../App';
import { queuedSongsVar } from '../grpahql/cache';


function SongList() {
    const { data, loading, error } = useQuery(GET_SONGS, {
        pollInterval: 2000
    });
   
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 50
            }}>
                <CircularProgress />
            </div>
        )
    }
    if (error) {
        return <div>Error retrieving Songs</div>
    }
    return <div>
                {data.songs.map(song => (<Song key={song.id} song={song} />))}
            </div>

};

export default SongList;



const useStyles = makeStyles(theme => ({
    container: {
        margin: theme.spacing(3)
    },
    songInfoContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    songInfo: {
        width: "100%",
        display: 'flex',
        justifyContent: 'space-between'
    },
    thumbnail: {
        objectFit: 'cover',
        width: 140,
        height:140
    }
}));

function Song({ song }) {
    const { id, title, artist, thumbnail } = song;
    const classes = useStyles();
    const { state, dispatch } = React.useContext(SongContext);
    const [ currentSongPlaying, setCurrentSongPlaying] = React.useState(false);
    const queuedSongsList =  useReactiveVar(queuedSongsVar);
      

    React.useEffect(() => {
        const isSongPlaying = state.isPlaying && id === state.song.id;
        setCurrentSongPlaying(isSongPlaying);
    }, [id, state.song.id, state.isPlaying]);

    function addSongToQueue() {    
        if (queuedSongsList.length !== 0) {
          const queuedIdList = queuedSongsList.map(song => song.id);
          if (!queuedIdList.includes(id)) {
              queuedSongsVar([...queuedSongsList, song]);   
          }
        } else {
            queuedSongsVar([song]);
        }
      };

    

    function handleTogglePlay() {
        dispatch({ type: "SET_SONG", payload: song});
        dispatch(state.isPlaying ? {type: "PAUSE_SONG" } : { type: "PLAY_SONG"});
    };

    return <Card className={classes.container}>
        <div className={classes.songInfoContainer}>
            <CardMedia image={thumbnail} className={classes.thumbnail}/>
            <div className={classes.songInfo}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {title}
                    </Typography>
                    <Typography gutterBottom variant="body1" component="p" color="textSecondary">
                        {artist}
                    </Typography>
                </CardContent>
                <CardActions>
                    <IconButton size="small" color="primary" onClick={handleTogglePlay}>
                        {currentSongPlaying ? 
                        (<Pause />) 
                        : 
                        (<PlayArrow />)}
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={addSongToQueue}>
                        <Save  />
                    </IconButton>
                </CardActions>
            </div>
        </div>
    </Card>;
};

