import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { Entity } from "./schema/Entity";
import { Player } from "./schema/Player";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();

  messages = {
    mouse: (client: Client, payload: string) => {
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
    },

    _: (client: Client, type: string, message: any) => {
      console.log("fallback message handler... received message", { type, message });
    },
  };

  onCreate(options: any) {

    // populate state/world
    this.state.populate();

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

  onDrop(client: Client) {
    const player = this.state.entities.get(client.sessionId) as Player;
    if (!player) { return; }

    player.disconnected = true;
    this.allowReconnection(client, 15);
  }

  onReconnect(client: Client<any>): void | Promise<any> {
    const player = this.state.entities.get(client.sessionId) as Player;
    if (!player) { return; }

    player.disconnected = false;
  }

  async onLeave(client: Client, code: number) {
    console.log(client.sessionId, "LEFT!");
    this.state.entities.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}

