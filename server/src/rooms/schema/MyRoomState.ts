import { generateId } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

import { Entity } from "./Entity";
import { Player } from "./Player";

export const DEFAULT_PLAYER_RADIUS = 10;
export const WORLD_SIZE = 2000;

export class MyRoomState extends Schema {

  @type("number") timeElapsed = 0;
  @type({ map: Entity }) entities = new MapSchema<Entity>();

  populate () {
    // create some food entities
    for (let i = 0; i < 20; i++) {
      this.createFood();
    }
  }

  createFood () {
    const food = new Entity().assign({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      radius: Math.max(4, (Math.random() * (DEFAULT_PLAYER_RADIUS - 1)))
    });
    this.entities.set(generateId(), food);
  }

  createPlayer(sessionId: string) {
    const player = new Player().assign({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE
    });
    this.entities.set(sessionId, player);
    return player;
  }

  update() {
    const deadEntities: string[] = [];
    this.entities.forEach((entity, sessionId) => {
      if (entity.dead) {
        deadEntities.push(sessionId);
        return;
      }

      if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
        this.entities.forEach((collideTestEntity, collideSessionId) => {
          // prevent collision with itself
          if (collideTestEntity === entity) { return; }

          if (
            entity.radius > collideTestEntity.radius &&
            Entity.distance(entity, collideTestEntity) <= entity.radius - (collideTestEntity.radius / 2)
          ) {
            let winnerEntity: Entity = entity;
            let loserEntity: Entity = collideTestEntity;
            let loserEntityId: string = collideSessionId;

            winnerEntity.radius += loserEntity.radius / 5;
            loserEntity.dead = true;
            deadEntities.push(loserEntityId);

            // create a replacement food
            if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
              this.createFood();

            } else {
              console.log(loserEntityId, "has been eaten!");
            }
          }
        });
      }

      if (entity.speed > 0) {
        entity.x -= (Math.cos(entity.angle)) * entity.speed;
        entity.y -= (Math.sin(entity.angle)) * entity.speed;

        // apply boundary limits
        if (entity.x < 0) { entity.x = 0; }
        if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
        if (entity.y < 0) { entity.y = 0; }
        if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }
      }
    });

    // delete all dead entities
    deadEntities.forEach(entityId => {
      this.entities.delete(entityId);
    });
  }
}
