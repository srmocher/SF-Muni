import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown'; 
import {FormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {SpinnerModule} from 'angular2-spinner';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports:[AngularMultiSelectModule, BrowserModule,
        HttpModule,
        SpinnerModule,
        FormsModule]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  })); 
});
