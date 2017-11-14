import { TestBed, inject } from '@angular/core/testing';

import { SfMuniService } from './sf-muni.service';

import {XHRBackend,ResponseOptions,HttpModule} from '@angular/http';

import {MockBackend} from '@angular/http/testing';

describe('SfMuniService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [SfMuniService,
        { provide: XHRBackend, useClass: MockBackend }]
    });
  });

  it('should be created', inject([SfMuniService], (service: SfMuniService) => {
    expect(service).toBeTruthy();
  }));

  it('should return arteries on success',inject([SfMuniService,XHRBackend],(service: SfMuniService,mockBackend:MockBackend)=>{
    let mockResponse = {
      type:"FeatureCollection",
      features:[{
        type:"Feature",
        properties:[]
      }]
    };
    
    mockBackend.connections.subscribe((connection)=>{
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    })

    service.getArteries().then(response =>{
      expect(response.length).toEqual(1);
      expect(response.type).toEqual("FeatureCollection");
    })
  }));

  it('should return freeways on success',inject([SfMuniService,XHRBackend],(service: SfMuniService,mockBackend:MockBackend)=>{
    let mockResponse = {
      type:"FeatureCollection",
      features:[{
        type:"Feature",
        properties:[]
      },{
        type:"Feature",
        properties:[]
      }]
    };
    
    mockBackend.connections.subscribe((connection)=>{
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    })

    service.getFreeways().then(response =>{
      expect(response.length).toEqual(2);
      expect(response.type).toEqual("FeatureCollection");
    })
  }))

  it('should return neighborhoods on success',inject([SfMuniService,XHRBackend],(service: SfMuniService,mockBackend:MockBackend)=>{
    let mockResponse = {
      type:"FeatureCollection",
      features:[{
        type:"Feature",
        properties:[]
      },{
        type:"Feature",
        properties:[]
      },{
        "type":"Feature",
        properties:[]
      }]
    };
    
    mockBackend.connections.subscribe((connection)=>{
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    })

    service.getNeighborhoods().then(response =>{
      expect(response.length).toEqual(3);
      expect(response.type).toEqual("FeatureCollection");
    })
  }));

  it('should return streets on success',inject([SfMuniService,XHRBackend],(service: SfMuniService,mockBackend:MockBackend)=>{
    let mockResponse = {
      type:"FeatureCollection",
      features:[{
        type:"Feature",
        properties:[{"STREET":"test"}]
      },{
        type:"Feature",
        properties:[]
      }]
    };
    
    mockBackend.connections.subscribe((connection)=>{
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    })

    service.getStreets().then(response =>{
      expect(response.length).toEqual(2);
      expect(response.type).toEqual("FeatureCollection");
      expect(response.features[0].properties["STREET"]).toEqual("test");
    })
  }));

  it('should handle errors',inject([SfMuniService,XHRBackend],(service: SfMuniService,mockBackend:MockBackend)=>{
    let mockResponse = {
      type:"FeatureCollection",
      features:[{
        type:"Feature",
        properties:[{"STREET":"test"}]
      },{
        type:"Feature",
        properties:[]
      }]
    };
    
    mockBackend.connections.subscribe((connection)=>{
      connection.mockRespond(new Response(new ResponseOptions({
        status:403
      })));
    })

    service.getStreets().then(response =>{
      expect(response.status).toBe(403);
    })
  }));


});
