import { TestBed, inject, tick } from '@angular/core/testing';

import { NextbusService } from './nextbus.service';

import {HttpModule,XHRBackend,Http,ResponseOptions,RequestOptions,BaseRequestOptions,ConnectionBackend} from '@angular/http';

import { MockBackend } from '@angular/http/testing';

import {Injectable,Injector} from '@angular/core';

import {Route} from './route';

import {VehicleLocation} from './vehiclelocation';




describe('NextbusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        {
          provide: XHRBackend,
          useClass: MockBackend
        },
        NextbusService
      ]
    });

    
  });

  it('should be created', inject([XHRBackend,NextbusService], (mockBackend:MockBackend,service: NextbusService) => {
    expect(service).toBeTruthy();
  }));

  it('should return routes on success', inject([XHRBackend,NextbusService], (mockBackend:MockBackend,service: NextbusService) => {
      let result:Route[];
      
      
      let r1 = new Route();
      r1.tag = "r1";
      let r2 = new Route();
      r2.tag = "r2";
      
      mockBackend.connections.subscribe((connection: any) =>{
        connection.mockRespond(new Response(new ResponseOptions({
          body:JSON.stringify([r1,r2])
        })));
      });

      service.getRoutes().then(routes=>{
        expect(routes.length).toEqual(2);
        expect(routes[0]).toBe(r1);
      })
  }));

  it('should return locations on success', inject([XHRBackend,NextbusService], (mockBackend:MockBackend,service: NextbusService) => {
    let mockResponse = {
      vehicle:[{"id":1,"speedKmHr":5},{"id":2,"speedKmHr":6}]
    }
    let result = []
    let routeTag = "test";
    
    mockBackend.connections.subscribe((connection: any) =>{
      connection.mockRespond(new Response(new ResponseOptions({
        body:mockResponse
      })));
    });

    service.getLocation(routeTag).then(locations=>{
        expect(locations.vehicle.length).toBe(2);
    })
}));

});
