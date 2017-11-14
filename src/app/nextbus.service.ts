import { Injectable } from '@angular/core';
import {Route} from './route';
import {Http,Response} from '@angular/http';
import {VehicleLocation} from './vehiclelocation';
import { environment } from '../environments/environment';

/**
 * A service to fetch Next Bus routes and vehicle locations
 */
@Injectable()
export class NextbusService {

  private baseURL:string; // nextbus API url
  constructor(private http:Http) {
    this.baseURL = environment.nextBusServiceURL;
   }

   /**
    * Queries the NextBus API to get the list of routes for SF MUNI area as a promise
    */
  getRoutes():Promise<Route[]>{
    return this.http.get(this.baseURL+"?command=routeList&a=sf-muni").toPromise()
    .then(response=>response.json().route as Route[]).catch(this.handleError);
  }

  /**
   * Queries the Next Bus API to get list of vehicles and locations for the specified route tag
   * @param routeTag A route tag in SF Muni area
   */
  getLocation(routeTag):Promise<any>{
    return this.http.get(this.baseURL+"?command=vehicleLocations&a=sf-muni&r="+routeTag).toPromise()
    .then(response=>response.json())
    .catch(this.handleError);
  }

  /**
   * A common method for handling HTTP errors
   * @param error An error which occurred in HTTP call
   */
  private handleError(error:any):Promise<any>{
    console.error("Error occured while fetching NextBus Service data",error);
    return Promise.reject(error.message||error);
  }

}
