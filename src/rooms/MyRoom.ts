import { Room, Client } from "colyseus";
import { Entity } from "./schema/Entity";
import { State } from "./schema/State";

interface MouseMessage {
  x: number;
  y: number;
}

export class MyRoom extends Room<State> {

  onCreate() {
    this.setState(new State());
    this.state.initialize();

    this.onMessage("mouse", (client, messageString) => {
      const message = JSON.parse(messageString)
      const entity = this.state.entities.get(client.sessionId);

      // skip dead players
      if (!entity) {
        console.log("DEAD PLAYER ACTING...");
        return;
      }

      // change angle
      const dst = Entity.distance(entity, message as Entity);
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
      entity.angle = Math.atan2(entity.y - message.y, entity.x - message.x);

      // console.log(message, { speed: entity.speed, angle: entity.angle });
    });

    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "LEFT!");
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}