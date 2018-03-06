import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//angular modules

import { HttpModule, RequestOptions } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WebRTCComponent }   from './app.component';

import { routing } from './app.routing';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        routing
    ],
    declarations: [WebRTCComponent],
    bootstrap: [WebRTCComponent]
})

export class AppModule {}