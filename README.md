# rolebot

1. remember to `npm install` in root dir
2. then `tsc`
3. puis `node .`


4. remember to recreate config.json
```json
{
    "token": "TOKEN",
    "app_id": "ID",
    
    "token_beta": "TOKEN_BETA",
    "app_id_beta": "ID_BETA",
    
    "dev_server_id" : "DEV_SERVER",

    "debug": false
}
```
when debug mode is `true`, `token_beta` and `app_id_beta` are used
add the ID of a server to test the commands (this is mandatory)