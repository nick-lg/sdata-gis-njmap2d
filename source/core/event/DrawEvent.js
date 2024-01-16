import { Event } from "./Event";
import { DrawEventType } from "./EventType";

class DrawEvent extends Event
{
    constructor()
    {
        super(Object.values(DrawEventType))
    }
}
export {DrawEvent}