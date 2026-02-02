import "./config/auth";
import { defineServer, defineRoom, createEndpoint, createRouter, matchMaker, monitor, playground } from "colyseus";
import { auth } from "@colyseus/auth"

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";

export default defineServer({
  /**
   * Define your room handlers:
   */
  rooms: {
    my_room: defineRoom(MyRoom),
  },

  routes: createRouter({
    api_hello: createEndpoint("/api/hello", {method: "GET"}, async (ctx) => {
      return { message: "Hello, world!" }
    })
  }),

  /**
   * Bind your express routes here:
   * Read more: https://expressjs.com/en/starter/basic-routing.html
   */
  express: (app) => {
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
