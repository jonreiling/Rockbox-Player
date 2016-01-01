# Rockbox-Player

A lightweight, communal jukebox built on Spotify and designed for the Raspberry Pi.

##Philosophy

Rockbox was specifically designed for an office setting, one where anyone can feel comfortable contributing to the mood of the environment. As such, much of the "standard" player functionality—previous tracks, the ability to see what's upcoming, the lack of playlisting—has been excluded. You know. A jukebox. 

##Requirements
- Raspberry PI (Raspbian)
- [Rockbox-Passthrough-Server](https://github.com/jonreiling/Rockbox-Passthrough-Server)
- OSX 10.10 (unsupported, but works for testing)

##Passthrough Server

The Rockbox-Player is only responsible for handling playback. Interfacing with it is done through websockets (specifically Socket.IO). In this case, it is easiest to use the [Rockbox-Passthrough-Server](https://github.com/jonreiling/Rockbox-Passthrough-Server), which can run along side Rockbox-Player and provides a full API for interacting with Rockbox.

In addition, Rockbox-Passthrough-Server can be deployed remotely so that you can securely control the Rockbox-Player remotely, even if the Raspberry Pi is on a local network. I have personally used openshift.com for this to great effect.

##Dependencies
- Node 0.10.xx 
- [libspotify](https://developer.spotify.com/technologies/libspotify/)
- [node-spotify](http://www.node-spotify.com)
- Premium Spotify Account
- [Spotify Developer Account](https://developer.spotify.com)
- [EchoNest API key](http://developer.echonest.com) (optional)

##Installation

####spotify_appkey.key

First, you'll need to register a new app with Spotify. You can do so here(https://devaccount.spotify.com/my-account/keys/).

Once your key is created, download the Binary version and save it as spotify_appkey.key in the root directory.

####.env variables

Create a file named `.env` in the application directory

```
SPOTIFY_USER=
SPOTIFY_PASS=
PASSTHROUGH_SERVER=
#ECHONEST_KEY=
```

- SPOTIFY_USER Username of the spotify account that libspotify will use
- SPOTIFY_PASS Password for that user
- PASSTHROUGH_SERVER URL where Rockbox-Passthrough-Server is running. This can be the same machine, in which case this will be http://localhost:3000
- ECHONEST_KEY Add this line if you'd like to use Echonest along with the RadioQueueManager class to create an automatic radio station of music based on the last song you played. Get an API key here(http://developer.echonest.com).
- ECHONEST_TASTE Coming soon

####Node 0.10.28

Older versions of node can be a bit harder to come by pre-compiled for the raspberry pi. The easiest way to install in this:
```
wget http://nodejs.org/dist/v0.10.28/node-v0.10.28-linux-arm-pi.tar.gz
cd /usr/local && sudo tar --strip-components 1 -xzf ~/node-v0.10.28-linux-arm-pi.tar.gz
```

####libspotify

For the raspberry pi, install the hard float version of libspotify. Because libspotify is no longer maintained, the links below shouldn't change

```
wget https://developer.spotify.com/download/libspotify/libspotify-12.1.103-Linux-armv6-bcm2708hardfp-release.tar.gz

tar xzf libspotify-12.1.103-Linux-armv6-bcm2708hardfp-release.tar.gz 
rm libspotify-12.1.103-Linux-armv6-bcm2708hardfp-release.tar.gz

cd libspotify-12.1.103-Linux-armv6-bcm2708hardfp-release/
sudo make install prefix=/usr/local 

cd ../
rm -r libspotify-12.1.103-Linux-armv6-bcm2708hardfp-release/
```

####node-spotify
You may have noticed by now that node-spotify is not included in package.json. It's possible to compile node-spotify directly by uncommenting it from the dependencies, but it's much easier to use the pre-compiled binary, available from [node-spotify](http://www.node-spotify.com). 

From the project directory:
```
wget http://www.node-spotify.com/builds/0.7.0/node-spotify-0.7.0-linux-arm6hf.zip
unzip node-spotify-0.7.0-linux-arm6hf.zip
mv node-spotify-0.7.0-linux-arm6hf/* node_modules

rm node-spotify-0.7.0-linux-arm6hf
```

####NPM
Finally, just install the remaining dependencies using npm.

```
npm install
npm start
```

##Miscellaneous

####Downmixing to mono

In cases where you might have multiple, non-directional speakers, it's best to have mono output. Achieving this on the software side is easy. 

```
sudo pico /etc/asound.conf
```

```
pcm.card0 {
  type hw
  card 0
}

ctl.card0 {
  type hw
  card 0
}

pcm.monocard {
  slave.pcm card0
  slave.channels 2
#  type plug
  type route
  ttable {
    # Copy both input channels to output channel 0 (Left).
    0.0 1
    1.0 1
    # Send the output to channel 1 (Right).
    0.1 1
    1.1 1
  }
}

ctl.monocard {
  type hw
  card 0
}

pcm.!default monocard
```
Finally, restart alsa
```
/etc/init.d/alsa-utils restart
```
