import "./config/auth";
import config from "@colyseus/tools";
import { auth } from "@colyseus/auth"
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { matchMaker } from "colyseus";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.get("/json_data", (req, res) => {
          res.json({ ok: true })
        })

        app.post("/pingpong", (req, res) => {
          console.log("/pingpong", req.body)
          res.json(req.body);
        })

        // Custom seat reservation
        app.get("/reserve-seat", async (req, res) => {
          const seatReservation = await matchMaker.create("my_room", {});
          res.json(seatReservation);
        });

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());

        app.use(auth.prefix, auth.routes());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
