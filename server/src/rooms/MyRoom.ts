import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Entity } from "./schema/Entity";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    // populate state/world
    this.state.populate();

    this.onMessage("*", (client, type, message) => {
      console.log(client.sessionId, "sent message:", type, message);
    });

    this.onMessage("mouse", (client, payload) => {
      const message = JSON.parse(payload);
      const entity = this.state.entities.get(client.sessionId);

      // entity may be already dead.
      if (!entity) {
        console.log("a dead player trying to move...");
        return;
      }

      // update entity angle & speed
      const distance = Entity.distance(entity, message as Entity);
      entity.speed = (distance < 20) ? 0 : Math.min(distance / 15, 4);
      entity.angle = Math.atan2(entity.y - message.y, entity.x - message.x);
    });

    // update world simulation
    this.setSimulationInterval(() => {
      this.state.update();
    });

    // increment "timeElapsed" every second
    this.clock.setInterval(() => {
      this.state.timeElapsed++;

      this.broadcast("example", {
        many: "many",
        fields: "fields",
        here: "here",
      });
    }, 1000);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED with options: ", options);
    const player = this.state.createPlayer(client.sessionId);

    this.clock.setTimeout(() => {
      client.send("start", player.toJSON());
    }, 1000);
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "LEFT!");
    const entity = this.state.entities.get(client.sessionId);

    // entity may be already dead.
    if (entity) {
      entity.dead = true;
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
