import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollService } from './scroll-service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ScrollService,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
