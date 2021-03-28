import { Avatar, IconButton, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { queuedSongsVar } from '../grpahql/cache';


function QueuedSongList() {

    const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up('md'));
    const  songs = useReactiveVar(queuedSongsVar);

    return ( 
        greaterThanMd && (
            <div style={{ margin: "10px 0" }}>
                <Typography color="textSecondary" variant="button">
                    {`QUEUE (${songs && songs.length === 0 ? 0: songs.length})`}
                </Typography>
                <div>
                    {songs && songs.length === 0 ? (
                        <p>No items in your cart</p>
                    ) : (
                        
                        <React.Fragment>
                            {songs && songs.map(song => (
                                <QueuedSong key={song.id} song={song} />))}
                        </React.Fragment>
                    )}
                </div>     
            </div>
        )
    );
};

const useStyles = makeStyles({
   avatar: {
       width: 44,
       height: 44
   },
   text: {
       textOverflow: 'ellipsis',
       overflow: 'hidden',
   },
   container: {
       display: 'grid',
       gridAutoFlow: 'column',
       gridTemplateColumns: '50px auto 30px',
       gridGap: 12,
       alignItems: 'center',
       marginTop: 10
   },
   songInfoContainer: {
       overflow: 'hidden',
       whiteSpace: 'nowrap',
   }

});

function QueuedSong({ song }) {
    const { title, artist, thumbnail, id } = song;
    const classes = useStyles();
    const  songs = useReactiveVar(queuedSongsVar);

    function deleteSongFromQueue() {
        const filteredSongs = songs.filter(song => song.id !== id);
        
        if (filteredSongs.length === 0) {
            queuedSongsVar([]);
        } else {
            queuedSongsVar([...filteredSongs]);
        }   
    };

    return (
        <div className={classes.container}>
            <Avatar className={classes.avatar} src={thumbnail} alt="Song thumbnail" />
            <div className={classes.songInfoContainer}>
                <Typography variant="subtitle2" className={classes.text}>
                    {title}
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    {artist}
                </Typography>
            </div>
                <IconButton  onClick={deleteSongFromQueue}>
                    <Delete 
                    color="error"
                    />
                </IconButton>
        </div>
    );
};

export default QueuedSongList;