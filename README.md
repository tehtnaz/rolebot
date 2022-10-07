# rolebot (temporary name, im lazy)

**This code was literally written in 3 hours. Expect it to be shoddy. I'll clean it up over time**

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
dev_server_id is the ID of a server for having the commands applied instantly (sometimes, you the other request will get rate limited, this server won't)
^^THIS IS MANDATORY^^



**run the bot with** `node .`

nothing too complicated
