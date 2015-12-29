# Rockbox-Player

A lightweight communal jukebox built around Spotify and designed for the Raspberry Pi.

##Requirement
-OSX 10.10
-Raspberry PI (Raspbian)
-[Rockbox-Passthrough-Server](https://github.com/jonreiling/Rockbox-Passthrough-Server)

##Passthrough Server

The Rockbox-Player is only responsible for handling playback. Interfacing with it is done through websockets (specifically Socket.IO). In this case, it is easiest to use the [Rockbox-Passthrough-Server](https://github.com/jonreiling/Rockbox-Passthrough-Server), which can run along side Rockbox-Player and provides a full API for interacting with Rockbox.

In addition, Rockbox-Passthrough-Server can be deployed remotely so that you can securely control the Rockbox-Player remotely, even if the Raspberry Pi is on a local network. I have personally used openshift.com for this to great effect.

##To run

```
npm start
end
```


##Dependencies

- libspotify(https://developer.spotify.com/technologies/libspotify/)
- [node-spotify](http://www.node-spotify.com)
- Premium Spotify Account
- [Spotify Developer Account](https://developer.spotify.com)
- [EchoNest API key](http://developer.echonest.com) (optional)

##Installation

####spotify_appkey.key

First, you'll need to register a new app with Spotify. You can do so here(https://devaccount.spotify.com/my-account/keys/).

Once your key is created, download the Binary version and save it as spotify_appkey.key in the root directory.

####.env variables

Create a file named ".env" in the root directory

```
SPOTIFY_USER=
SPOTIFY_PASS=
PASSTHROUGH_SERVER=
end
```

#####SPOTIFY_USER 
Username of the spotify account that libspotify will use

#####SPOTIFY_PASS
Password for that user

#####PASSTHROUGH_SERVER
URL where Rockbox-Passthrough-Server is running. This can be the same machine, in which case this will be http://localhost:3000

#####ECHONEST_KEY=
Add this line if you'd like to use Echonest along with the RadioQueueManager class to create an automatic radio station of music based on the last song you played. Get an API key here(http://developer.echonest.com).

#####ECHONEST_TASTE=

####libspotify & node-spotify

For now, see the [node-spotify repo](https://github.com/FrontierPsychiatrist/node-spotify) for installation instructions.

