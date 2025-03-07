import { type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { DEFAULT_PLAYER_RADIUS } from "./MyRoomState";

export class Player extends Entity {
    @type("number") level: number = 1;

    constructor() {
        super();
        this.radius = DEFAULT_PLAYER_RADIUS;
    }
}
