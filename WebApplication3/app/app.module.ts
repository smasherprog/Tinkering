
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar.component';


const appRoutes: Routes = [
    { path: 'calendar/:month/:year', component: CalendarComponent },
    { path: 'calendar', component: CalendarComponent }
];





@NgModule({
    imports: [BrowserModule, RouterModule.forRoot(appRoutes)],
    declarations: [AppComponent, CalendarComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

