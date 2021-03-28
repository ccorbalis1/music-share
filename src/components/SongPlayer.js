
import { Card, CardContent, IconButton, Typography, CardMedia, Slider, makeStyles} from '@material-ui/core';
import { PlayArrow, SkipNext, SkipPrevious, Pause } from '@material-ui/icons';
import React from 'react';
import { SongContext } from '../App';
import QueuedSongList from './QueuedSongList';
import ReactPlayer from 'react-player';
import { useReactiveVar } from '@apollo/client';
import { queuedSongsVar} from '../grpahql/cache';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 15px'
    },
    content: {
        flex: '1 0 auto'
    },
    thumbnail: {
        objectFit: 'cover',
        width: 150
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    playButton: {
        width: 38,
        height:38
    }

}));

function SongPlayer() {
    
    const { state, dispatch } = React.useContext(SongContext);
    const classes = useStyles();
    const [played, setPlayed] = React.useState(0);
    const [playedSeconds, setPlayedSeconds] = React.useState(0);
    const [seeking, setSeeking] = React.useState(false);
    const [positionInQueue, setPositionInQueue] = React.useState(0);
    const reactPlayerRef = React.useRef();
    const  songs = useReactiveVar(queuedSongsVar);
   
    /* This useEffect manages the behavior of the player with respect to the queue. The logic is as follows:
       When the end of the current playing song is reached, we execute the following, otherwise we do nothing.
       1) Get the index of the song that jsut finished in the song queue.
       2) If the song is not in the queue (e.g. the play was forced from the song list) then get the position
          of the last song of the queue that was played and incerment it and fetch this song (may be undefined). 
          If the song was in the queue then fetch the next song in the queue to play.
        3) If the next song exisits, then load this song into the player and set the Played counter to 0.
           If the next song does not exist, we are at the end of the queue so we pause the song and set the
           Played counter to 0 */

    React.useEffect(() => {
        let nextSong;
        if (played >= 0.99) {
            const songIndex = songs.findIndex(song => song.id === state.song.id);
            if (songIndex !== -1) {
                nextSong = songs[songIndex + 1];
            } else {
                setPositionInQueue(prevPositionInQueue => prevPositionInQueue + 1);
                nextSong = songs[positionInQueue];
            }
            if (nextSong) {
                    //console.log("Next Song = ", nextSong)
                    setPlayed(prevPlayed => prevPlayed * 0 );
                    dispatch({ type: "SET_SONG", payload: { ...nextSong }});
            } else {
                dispatch({type: "PAUSE_SONG"});
                setPlayed(prevPlayed => prevPlayed * 0 );
            }
        }       
    }, [played, positionInQueue, songs, state.song.id, dispatch] );

    function handleTogglePlay() {
        dispatch(state.isPlaying ? {type: "PAUSE_SONG" } : { type: "PLAY_SONG"});
    };

    function handleProgressChange(event, newValue) { 
        setPlayed(newValue);

    };

    function handleSeekMouseDown() {
        setSeeking(true);
    };

    function handleSeekMouseUp() {
        setSeeking(false);
        reactPlayerRef.current.seekTo(played);

    };
    
    function formatDuration(seconds) {
        return new Date(seconds * 1000).toISOString().substr(11,8);
    };

    function handlePlayPreviousSong() {
        const prevSong = songs[positionInQueue - 1];
   
        if (prevSong) {
            setPositionInQueue(prevPositionInQueue => prevPositionInQueue - 1);
            dispatch({ type: "SET_SONG", payload: { ...prevSong }});
        }
    };

    function handlePlayNextSong() {
        const nextSong = songs[positionInQueue + 1];
        if (nextSong) {
            setPositionInQueue(prevPositionInQueue => prevPositionInQueue + 1);
            dispatch({ type: "SET_SONG", payload: { ...nextSong }});
        }
    };


    return (
        <>
            <Card className={classes.container} variant="outlined">
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography variant="h5" component="h3">
                            {state.song.title}
                        </Typography >
                        <Typography variant="subtitle1" component="p" color="textSecondary">
                            {state.song.artist}
                        </Typography>
                    </CardContent>
                    <div className={classes.controls}>
                        <IconButton>
                            <SkipPrevious onClick={handlePlayPreviousSong} />
                        </IconButton>
                        <IconButton onClick={handleTogglePlay}>
                            { state.isPlaying ? 
                                <Pause className={classes.playButton}/>
                            :
                                <PlayArrow className={classes.playButton}/>
                            }           
                        </IconButton>
                        <IconButton>
                            <SkipNext onClick={handlePlayNextSong}/>
                        </IconButton>
                        <Typography variant="subtitle1" component="p" color="textSecondary">
                            {formatDuration(playedSeconds)}
                        </Typography>
                    </div>
                    <Slider
                        onMouseDown={handleSeekMouseDown}
                        onMouseUp={handleSeekMouseUp}
                        onChange={handleProgressChange}
                        value={played} type="range" min={0} max={1} step={0.01} />                   
                </div>
               
                <CardMedia className={classes.thumbnail} image={state.song.thumbnail}/>
            </Card>
            <ReactPlayer 
                    ref={reactPlayerRef}
                    onProgress={({played, playedSeconds}) => {
                        if (!seeking) { 
                            setPlayed(played);
                            setPlayedSeconds(playedSeconds) }}}
                    
                    url={state.song.url} 
                    playing={state.isPlaying} />
            <QueuedSongList />
        </>
    )
};

export default SongPlayer;