import * as http from "http";
import {System} from "./System";
import {LoginEndpointController} from "../controllers/endpoints/LoginController";
import {LoginController} from "../controllers/frontend/LoginController";
import {TransactionController} from "../controllers/frontend/TransactionController";
import {HomeController} from "../controllers/frontend/HomeController";

const PORT = process.env.PORT || 3000;
const eventManager = require('./GlobalEvents');

let isTest:boolean = false;

let server:http.Server = null;

module.exports = {

    bootstrap : (express)=>{
        const app = express();
        const loader = System.loader(app);
        require("./DBConnection");

        app.set('views', require("path").resolve(__dirname,"../views") );
        app.set('view engine', 'ejs');

        app.use(express.json());                                    // to support JSON-encoded bodies
        app.use(express.urlencoded({ extended: true }));    // to support URL-encoded bodies
        app.use('/public',express.static("public"));    // makes public folder directly accessible

        // Cookies
        app.use(System.Middlewares.CookieHandler());

        // Log request
        app.use(System.Middlewares.LogRequest());

        // CSRF tokens
        app.use(System.Middlewares.CSRFHandler());

        // Routes
        loader.registerEndpointControllers(
            LoginEndpointController,
        );

        loader.registerBaseControllers(
            LoginController,
            TransactionController,
            HomeController
        );

        server =  app.listen(PORT, () => {
            eventManager.trigger("APP_READY", PORT);
            System.log('Status',`App is running on port ${PORT}`);

            eventManager.listen("DB_READY", ()=>{
                eventManager.trigger("STACK_READY",server);
                System.log('Status',`DB is running on port 3306`);

                if (!System.isProduction() && !isTest) require("./seeder");
            },{singleUse:true,autoTriggerIfMissed:true});
        });

        System.attachTerminateListeners(server);

        return server;
    },

    enableTestMode: ()=>{
        isTest = true;
        System.haltOutput();
    },

    getServer: async ()=>{
        return new Promise<http.Server>(resolve => {
            if (server === null){
                eventManager.listen("STACK_READY", function(serv){
                    resolve(serv);
                });
            }
            else resolve(server);
        });
    }

};