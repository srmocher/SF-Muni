import { Component,OnInit,ElementRef } from '@angular/core';
import {SfMuniService} from './sf-muni.service';
import {NextbusService} from './nextbus.service';
import {D3Service,D3,Selection,GeoPath,ZoomBehavior,Transition} from 'd3-ng2-service';
import {Observable} from 'rxjs';
import {Route} from './route';
import {VehicleLocation} from './vehiclelocation';
import { List } from 'linqts';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SfMuniService,NextbusService,D3Service]
})

/**
 * AppComponent - main ng2 component for rendering map and vehicle locations on it
 */
export class AppComponent implements OnInit {
  private d3: D3; // d3 instance
  private svg: any; // svg created using d3
  private width: number; // screen width
  private height: number; // screen height
  private path; // path for drawing the GeoJSON features
  private projection; // Map projection - Mercator
  private groups = []; // store groups for arteries, neighborhoods, streets and freeways
  private static CLASS_LIST = ["artery", "freeway", "neighborhood", "street"];
  private routes: Route[] ; //  list of routes
  private vehicles: List < VehicleLocation > ; // LINQ list for vehicle locations - easier to query/filter with lambda queries
  private readonly center = [-122.433701, 37.767683]; // SF center for map projection

  private routeTags; // list of items of route tags for binding with dropdown
  private selectedRoutes; //list of routes selected by user
  private dropdownSettings; // settings for dropdown
  private loadingRoutes; // flag for progress spinner


  /**
   * 
   * @param sfMuniService - service to fetch map JSON objects for drawing using d3
   * @param nextBusService - service which internally invokes NextBus API for real-time vehicle/routes
   * @param d3Service  - service to use d3 capabilities with ng2
   */
  constructor(private sfMuniService: SfMuniService, private nextBusService: NextbusService, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  /**
   * Creates d3 svg element, map projection, sets up recurring 15 second call for vehicle locations
   * Zoom settings and dropdown options
   */
  ngOnInit() {

    this.loadingRoutes = true;
    let d3 = this.d3;
    this.height = window.screen.height;
    this.width = window.screen.width;
    this.selectedRoutes = [];
    this.routeTags = [];

    // Create d3 map projection and position center to SF and appropriately scale - trial and error!
    this.projection = d3.geoMercator();
    this.projection.center(this.center).scale(250000)
      .translate([this.width / 2, this.height / 2]);
    this.path = d3.geoPath().projection(this.projection);


    //
    this.svg = d3.select("app-root").append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // create 4 groups - streets, freeways, neighborhoods and artieries
    this.groups.push(this.svg.append("g"));
    this.groups.push(this.svg.append("g"))
    this.groups.push(this.svg.append("g"));
    this.groups.push(this.svg.append("g"));

    // setup zom
    this.setupZoom();

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Routes",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'dropdown',
      badgeShowLimit: 5 //show only 5 selections in the box
    };

    this.vehicles = new List < VehicleLocation > ();

    //Get all routes from NextBus API
    this.getRoutes();

    //combine all promises to get various GeoJSON objects and operate on them after promises are resolved
    Observable.forkJoin([
        this.sfMuniService.getArteries(),
        this.sfMuniService.getFreeways(),
        this.sfMuniService.getNeighborhoods(),
        this.sfMuniService.getStreets()
      ])
      .subscribe(t => {


        //draw GeoJSON features as a separategroup and assign corresponding CSS class
        for (var i = 0; i < this.groups.length; i++) {
          this.draw(t[i], this.groups[i], AppComponent.CLASS_LIST[i]);
        }

        
      });

    //Repeatedly poll vehicle locations every 15 seconds
    Observable.interval(15000).takeWhile(() => true).subscribe(() => this.getLocations());

  }

  /**Setups up zoom using d3 for zooming onto the map and maintaining vehicle positions
   * using transform
   */
  private setupZoom() {

    // Use d3 zoom extension and define zoom extent, and transformation for elements affected by zoom
    const zoom = this.d3.zoom()
      .scaleExtent([0.1, 10]) //zoom limit
      .on('zoom', () => {

        // include transform for all 4 groups
        for (let group of this.groups) {
          group.style('stroke-width', `${1.5 / this.d3.event.transform.k}px`)
          group.attr('transform', this.d3.event.transform) // updated for d3 v4
        }

        // include transform for vehicles
        this.svg.selectAll("image")
          .style('stroke-width', `${1.5 / this.d3.event.transform.k}px`)
          .attr('transform', this.d3.event.transform)

      });

    this.svg.call(zoom)
      .append('svg:g')
      .attr('transform', 'translate(100,50) scale(.5,.5)');

  }


  /**
   * @param  {} featureCollection - GeoJSON feature collection for the corresponding group 
   * @param  {} group - any of the 4 groups - streets, arteries, freeways, neighborhoods
   * @param  {} cssClass - css class name to apply to the group
   */
  private draw(featureCollection, group, cssClass) {


    //draw paths using GeoJSON features and set CSS class
    group.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("class", cssClass)
      .attr("d", this.path);

    // draw neighborhood label over the map at the center of each path
    group.selectAll("text")
      .data(featureCollection.features)
      .enter()
      .append("svg:text")
      .text(function (d) {

        return d.properties.neighborho;

      })
      .attr("x", d => {
        return this.path.centroid(d)[0];
      })
      .attr("y", d => {
        return this.path.centroid(d)[1];
      })
      .attr("class", "text");

  }

  /** Asynchronouly fetch list of SF Muni NextBus service routes
   *  for loading the dropdown with route tags and also for fetching
   *  vehicle locations
   */
  private getRoutes() {
    this.nextBusService.getRoutes().then(routes => {
      this.routes = routes;
      for (let i = 0; i < routes.length; i++) {

        this.routeTags.push({
          id: i,
          itemName: routes[i].tag
        });
      }
      this.selectedRoutes = this.routeTags;
    });
  }


  /**
   * Fetch parallely and asynchronously the list of vehicles and their 
   * info - location, speed, heading etc for selected route tags and update
   * the map as soon as finished. Invoked every 15 seconds
   */
  private getLocations() {

   for(let route of this.selectedRoutes){
     this.nextBusService.getLocation(route.itemName).then(vLocations =>{
       let vehicleLocations = vLocations.vehicle as VehicleLocation[];
       if(vehicleLocations!=undefined){
          for(let vehicle of vehicleLocations){
            vehicle.visible = true; //vehicle will be visible since it's from a selected route
            this.addOrUpdateVehicle(vehicle);
          }
          this.loadingRoutes = false;
          this.updateMapLocationsForVehicles();
       }
     })
   }
      
   

  }

  /**
   * Used to add/update the map with vehicle positions/transitions.
   * Vehicle is drawn as a bus icon and visibility is affected by the selected routes
   * by the user
   */
  private updateMapLocationsForVehicles() {
    // d3 transition as vehicles get added/updated
    var t = this.d3.transition()
      .duration(550)
      .ease(this.d3.easeBack);


    if (this.vehicles.Count() > 0) {
      // bind vehicles
      let icons = this.svg.selectAll("image")
        .data(this.vehicles.ToArray());

      // remove old/stale data
      icons.exit().remove();

      // for new data, add vehicle icons
      icons.enter().append("svg:image");

      // project latitude/longitude positon onto screen using map projection
      icons
        .attr("x", (d, i) => {
          var lat = d.lat;
          var lon = d.lon;
          return this.projection([lon, lat])[0];
        })
        .attr("y", (d, i) => {
          var lat = d.lat;
          var lon = d.lon;
          return this.projection([lon, lat])[1];
        })
        .attr("id", (d, i) => {
          return d.id;
        })
        .attr("xlink:href", "./assets/bus-64x64.png")
        .attr("class", (d, i) => {
          //console.log(d.visible);
          return d.visible ? "visible-bus" : "hidden-bus";
        })



    }

  }
  /**
   * Since data is fetched every 15 seconds, check if vehicle already exists
   * and update the parameters, otherwise add it to the list
   * @param v vehicle location object with vehicle id, speed updated from API
   */
  private addOrUpdateVehicle(v: VehicleLocation) {
    let exists = this.vehicles.Any(x => x.id == v.id);
    if (exists) {
      let vehicle = this.vehicles.First(x => x.id === v.id)
      vehicle.lat = v.lat;
      vehicle.lon = v.lon;
      vehicle.heading = v.heading;
      vehicle.speedKmHr = v.speedKmHr;
      vehicle.secsSinceReport = v.secsSinceReport;
      return;
    }
    this.vehicles.Add(v);
  }

  /**
   * Update the visibility of vehicles belonging to selected route tag
   * @param item Route tag selected by user
   */
  onItemSelect(item: any) {
    this.vehicles.Where(x => x.routeTag == item.itemName).ForEach(x => x.visible = true);
    this.updateMapLocationsForVehicles();
  }

  /**
   * Update the visibility of vehicles belonging to the remove route tag
   * @param item 
   */
  OnItemDeSelect(item: any) {
    this.vehicles.Where(x => x.routeTag == item.itemName).ForEach(x => x.visible = false);
    this.updateMapLocationsForVehicles(); //update d3
  }

  /**
   * Make all vehicles visibile
   * @param items All the selected routes
   */
  onSelectAll(items: any) {
    this.vehicles.ForEach(x => x.visible = true);
    this.updateMapLocationsForVehicles(); //update d3
  }

  /**
   * Make all vehicles invisible
   * @param items 
   */
  onDeSelectAll(items: any) {

    this.vehicles.ForEach(x => x.visible = false);
    this.updateMapLocationsForVehicles(); //update d3
  }

}
