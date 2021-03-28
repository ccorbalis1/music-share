import { Button, Dialog, InputAdornment, TextField, DialogActions, DialogContent, DialogTitle, makeStyles } from '@material-ui/core';
import { Link, AddBoxOutlined } from '@material-ui/icons';
import React from 'react';
import SoundcloudPlayer from 'react-player/lib/players/SoundCloud';
import YoutubePlayer from 'react-player/lib/players/YouTube';
import ReactPlayer from 'react-player';
import { ADD_SONG } from '../grpahql/mutations';
import { useMutation } from '@apollo/client';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center'
    },
    urlInput: {
       margin: theme.spacing(1) 
    },
    addSongButton: {
        margin: theme.spacing(1) 
    },
    dialog: {
        textAlign: 'center'
    },
    thumbnail: {
        width: '90%'
    }

}));

const DEFAULT_SONG = {
    duration: 0,
    title: "",
    artist: "",
    thumbnail: ""
};


function AddSong() {

    const classes = useStyles();
    const [addSong, {error}] = useMutation(ADD_SONG);
    const [url, setUrl] = React.useState('');
    const [dialog, setDialog] = React.useState(false);
    const [playable, setPlayable ] = React.useState(false);
    const [song, setSong] = React.useState(DEFAULT_SONG);

    React.useEffect(() => {
        const isPlayable = SoundcloudPlayer.canPlay(url) || YoutubePlayer.canPlay(url);
        setPlayable(isPlayable);
    }, [url])


    function handleCloseDialog() {
        setDialog(false);
    }

    async function handleEditSong({ player }) {
        const nestedPlayer = player.player.player;
        let songData;
        if (nestedPlayer.getVideoData) {
            songData = getYoutubeInfo(nestedPlayer);    
        } else if (nestedPlayer.getCurrentSound) {
            songData = await getSoundcloudInfo(nestedPlayer);
        }
        setSong({ ...songData, url });

    }

    function  getYoutubeInfo(player) {
        const duration = player.getDuration();
        const { title, video_id, author } = player.getVideoData();
        const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
        return {
            duration,
            title,
            artist: author,
            thumbnail
        };

    }

    function getSoundcloudInfo(player) {
        return new Promise( resolve => {
            player.getCurrentSound(songData => {
                if (songData) {
                    resolve({
                        duration: Number(songData.duration / 1000),
                        title: songData.title,
                        artist: songData.user.username,
                        thumbnail: songData.artwork_url.replace('-large', '-t500x500')
                    })
                }
            })
        });
    }

    function handleChangeSong(event) {
        const { name, value } = event.target;
        setSong(prevSong =>({
            ...prevSong, 
            [name] : value
        }));

    };

    async function handleAddSong() {
        try {
            const{ url, thumbnail, duration, title, artist} = song;
            await addSong({
                variables: {
                    url: url.length > 0 ? url : null,
                    thumbnail: thumbnail.length > 0 ? thumbnail : null,
                    duration: duration > 0 ? duration : null,
                    title: title.length > 0 ? title : null,
                    artist: artist.length > 0 ? artist : null  
                }
            });
            handleCloseDialog();
            setSong(DEFAULT_SONG);
            setUrl('');

        } catch (error) {

        }

    };

    function handleError(field) {
        return error?.graphQLErrors[0]?.extensions?.path.includes(field);
    }

    const { thumbnail, title, artist } = song;

    return (
        <div className={classes.container}>
            <Dialog
                className={classes.dialog}
                open={dialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>
                    Edit Song
                </DialogTitle>
                <DialogContent>
                    <img 
                        className={classes.thumbnail} 
                        src={thumbnail}
                        alt="Song Thumbnail"    
                    />
                    <TextField
                        value={title}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="title"
                        label="Title"
                        fullWidth
                        error={handleError('title')}
                        helperText={handleError('title') && "Fill out field"}
                    />
                    <TextField
                        value={artist}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="artist"
                        label="Artist"
                        fullWidth
                        error={handleError('artist')}
                        helperText={handleError('artist') && "Fill out field"}
                    />
                    <TextField
                        value={thumbnail}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="thumbnail"
                        label="Thumbnail"
                        fullWidth
                        error={handleError('thumbnail')}
                        helperText={handleError('thumbnail') && "Fill out field"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCloseDialog}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button 
                        color="primary"
                        variant="outlined"
                        onClick={handleAddSong}
                    >
                        Add Song
                    </Button>  
                </DialogActions>
            </Dialog>
            <TextField
                className={classes.urlInput}
                onChange={event => setUrl(event.target.value)}
                value={url}
                placeholder="Add Youtube or Soundcloud Url"
                fullWidth
                margin="normal"
                type="url"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Link />
                        </InputAdornment>
                    )
                    
                }}
            />
            <Button
                disabled={!playable}
                className={classes.addSongButton}
                variant="contained"
                color="primary"
                endIcon={<AddBoxOutlined />}
                onClick={() => setDialog(true)}>
                    ADD
            </Button>
            <ReactPlayer url={url} hidden onReady={handleEditSong} />

        </div>

    )
};

export default AddSong;