import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';
import { environment } from '../environments/environment';

/**
 * A service to fetch map data of San Francisco
 */
@Injectable()
export class SfMuniService {
  
  private baseURL:string; // environment specific URL - here local path for map objects
  constructor(private http:Http) { 
    this.baseURL = environment.mapServiceURL;
  }

  /**
   * Gets the JSON of arteries from GeoJSON file and returns a promise
   */
  getArteries():Promise<any>{
      return this.http.get(this.baseURL+"/arteries.json").toPromise().then(response => response.json()).catch(this.handleError);
  }

  /**
   * Gets the JSON of freeways from GeoJSON file and returns a promise
   */
  getFreeways():Promise<any>{
      return this.http.get(this.baseURL+"/freeways.json").toPromise().then(response => response.json()).catch(this.handleError);
  }

  /**
   * Gets the JSON of neighborhoods from GeoJSON file and returns a promise
   */
  getNeighborhoods():Promise<any>{
    return this.http.get(this.baseURL+"/neighborhoods.json").toPromise().then(response => response.json()).catch(this.handleError);
  }

  /**
   * Gets the JSON of streets from GeoJSON file and returns a promise
   */
  getStreets():Promise<any>{
    return this.http.get(this.baseURL+"/streets.json").toPromise().then(response => response.json()).catch(this.handleError);
  }

  /**
   * Common method for handling errors
   * @param error error during HTTP call/serialization
   */

  private handleError(error:any):Promise<any>{
    console.error("An error occurred while trying to fetch JSON.",error);
    return Promise.reject(error.message || error);
  }

}
