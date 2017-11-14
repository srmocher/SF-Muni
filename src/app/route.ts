/**
 * Models a route for NextBus API - minimal set of attributes required for this application
 */
export class Route{
    tag:string; //unique identifier for each route
    title:string; // descriptive title for route
    lastTime; // last time route vehicles were updated - useful for performance improvement
}