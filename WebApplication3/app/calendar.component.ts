import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { CalendarDay, CalendarMonth, CalendarWeek } from './calendarday';
import * as moment from 'moment'

@Component({
    moduleId: module.id,
    templateUrl: './templates/calendar.html'
})
export class CalendarComponent implements OnInit, OnDestroy {
    public CMonth = new CalendarMonth();

    sub: Subscription;
    constructor(private route: ActivatedRoute,
        private router: Router) {



    }
    ngOnInit() {
        var self = this;
        this.sub = this.route.params.subscribe(params => {
            self.changemonth(+params['month'], +params['year']);
        });
    }
    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
    changemonth(m: number, y: number): void {
        this.CMonth = new CalendarMonth();
        var start = moment();
        if ((m && y) && (m >= 1 && m <= 12)) {
            m -= 1;
            start.date(1).month(m).year(y);
        } else {
            start.date(1);
        }
        this.CMonth.StartDate = start.clone();
        var end = start.clone().add(1, 'months');
        var startweek = start.week();
        var sweekindex = 0;
        this.CMonth.WeeksInMonth.push(new CalendarWeek());

        for (var i = 0; i < start.day(); i++) {
            var daytoadd = new CalendarDay();
            daytoadd.CDay = start.clone().add(-start.day() +i, 'day');
            daytoadd.InMonth = false;
            this.CMonth.WeeksInMonth[sweekindex].DaysInWeek.push(daytoadd);
        }

        for (; start.isBefore(end); start.add(1, 'days')) {

            if (startweek != start.week()) {
                startweek = start.week();
                sweekindex++;
                this.CMonth.WeeksInMonth.push(new CalendarWeek());
            }
            var daytoadd = new CalendarDay();
            daytoadd.CDay = start.clone();
            this.CMonth.WeeksInMonth[sweekindex].DaysInWeek.push(daytoadd);
        }
    }

}

