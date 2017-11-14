/**
 * Model mirroring the vehicle location API response
 */
export class VehicleLocation{
    id:string; // vehicle ID number
    routeTag:string; // route to which vehicle belongs
    dirTag:string; // tag indicating direction along route
    lat:number; // latitude position
    lon:number; // longitude position 
    secsSinceReport:number; // seconds since vehicle position was last updated
    predictable:boolean; // vehicle route predictable or not
    heading:number; // bearing angle - useful for predicting next position
    speedKmHr:number; // speed in KMs/hr
    visible:boolean; // custom flag to filter vehicles to display on the map based on user selection

    constructor(){
    
    }
}