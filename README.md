# rolebot (temporary name, im lazy)

***!! Made with node 18, not tested with any others!!***

1. remember to `npm install` in root dir
2. then compile typescript with `tsc`

3. remember to recreate config.json. Place it in the root directory (ie. the path you're running the script from)
```json
{
    "token": "TOKEN",
    "app_id": "ID",
    
    "dev_server_id" : "DEV_SERVER",

    "debug": false
}
```
app_id - ID of the bot / application ID

dev_server_id is the ID of a server for having the commands applied instantly (sometimes, you the other request will get rate limited, this server won't)
  <-- YOU MUST HAVE A DEV SERVER ID

debug - only set to true if you want to enable debug logging


**run the bot with** `node .` or run the actual entry point file `node ./index.js`

nothing too complicated
