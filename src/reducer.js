function songReducer(state, action) {
    switch (action.type) {
        case "PLAY_SONG": {
            return {
                ...state, 
                isPlaying: true
            }
            
        }
        case "PAUSE_SONG": {
            return {
                ...state, 
                isPlaying: false
            }
        }
        
        case "SET_SONG": {
            console.log("Reducer Payload = ", action.payload)
            //const { artist, duration, id, thumbnail, title, url } = action.payload.song;
            //console.log("Names: ", title, artist, thumbnail);
            return {
                ...state,
                song: action.payload
            }
        }
            

        default:
            return state;

    }
}

export default songReducer;