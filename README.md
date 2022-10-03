# pixels

A pixel canvas anyone can draw on.

### [Support Discord](https://discord.gg/JF3kg77)

## Setup

- **`git clone https://github.com/qwertyquerty/pixels`**

- **`cd pixels`**

- **`npm i`**

- Edit the values in `config.json` to your liking

- **`npm start`** or **`pm2 start server.js -n pixels`**

## Config

```
{
 "host": "0.0.0.0",
 "port": 40,
 "dim": [300,200],
 "save_interval": 60000,
 "init_interval": 10000,
 "pixels_path": "./pixels.json",
 "default_color": "0"
}
```

- `host`: The host ip
- `port`: The port to host on (80 is default http port)
- `dim`: The dimensions of the board. If the board is too big, some serious lag can happen. Usually keep this under `[1000,1000]`
- `save_interval`: How often to save the board to `pixels_path` in case the server crashes, it can recover the pixels
- `init_interval`: How often to send the entire board to every client to correct mistakes (like unrecieved pixel changes)
- `pixels_path`: The JSON file to save the pixels to
- `default_color`: The default color for the board
