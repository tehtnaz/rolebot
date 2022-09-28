import { Sequelize } from "sequelize";
import readLine from 'readline-sync'
import { VoteRole } from "./models/VoteRole.js";

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});
const force = process.argv.includes('--force');

VoteRole.m_init(sequelize);
if(force){
    console.log("Are you sure you want to force the tables? (THIS WILL WIPE THE ENTIRE DATABASE!!!)");
    console.log('To confirm this action, write "WIPE ALL DATA AND RECREATE DATABASE": ')
        if(readLine.question() === 'WIPE ALL DATA AND RECREATE DATABASE'){
            console.log("Confirmed! Forcing tables to sync...")
        }else{
            console.log("Prompt doesnt match, prompt failed! Cancelling and quitting...");
            process.abort();
        }
}

sequelize.sync({ force }).then(async () =>{
    console.log("Database synced...")
    sequelize.close();

}).catch(console.error);