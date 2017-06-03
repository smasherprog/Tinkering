"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
require("rxjs/add/operator/switchMap");
var calendarday_1 = require("./calendarday");
var moment = require("moment");
var CalendarComponent = (function () {
    function CalendarComponent(route, router) {
        this.route = route;
        this.router = router;
        this.CMonth = new calendarday_1.CalendarMonth();
    }
    CalendarComponent.prototype.ngOnInit = function () {
        var self = this;
        this.sub = this.route.params.subscribe(function (params) {
            self.changemonth(+params['month'], +params['year']);
        });
    };
    CalendarComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
    };
    CalendarComponent.prototype.changemonth = function (m, y) {
        this.CMonth = new calendarday_1.CalendarMonth();
        var start = moment();
        if ((m && y) && (m >= 1 && m <= 12)) {
            m -= 1;
            start.date(1).month(m).year(y);
        }
        else {
            start.date(1);
        }
        this.CMonth.StartDate = start.clone();
        var end = start.clone().add(1, 'months');
        var startweek = start.week();
        var sweekindex = 0;
        this.CMonth.WeeksInMonth.push(new calendarday_1.CalendarWeek());
        for (var i = 0; i < start.day(); i++) {
            var daytoadd = new calendarday_1.CalendarDay();
            daytoadd.CDay = start.clone().add(-start.day() + i, 'day');
            daytoadd.InMonth = false;
            this.CMonth.WeeksInMonth[sweekindex].DaysInWeek.push(daytoadd);
        }
        for (; start.isBefore(end); start.add(1, 'days')) {
            if (startweek != start.week()) {
                startweek = start.week();
                sweekindex++;
                this.CMonth.WeeksInMonth.push(new calendarday_1.CalendarWeek());
            }
            var daytoadd = new calendarday_1.CalendarDay();
            daytoadd.CDay = start.clone();
            this.CMonth.WeeksInMonth[sweekindex].DaysInWeek.push(daytoadd);
        }
    };
    return CalendarComponent;
}());
CalendarComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        templateUrl: './templates/calendar.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute,
        router_1.Router])
], CalendarComponent);
exports.CalendarComponent = CalendarComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FsZW5kYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTZEO0FBQzdELDBDQUFpRTtBQUNqRSx1Q0FBcUM7QUFHckMsNkNBQXlFO0FBQ3pFLCtCQUFnQztBQU1oQyxJQUFhLGlCQUFpQjtJQUkxQiwyQkFBb0IsS0FBcUIsRUFDN0IsTUFBYztRQUROLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQzdCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFKbkIsV0FBTSxHQUFHLElBQUksMkJBQWEsRUFBRSxDQUFDO0lBUXBDLENBQUM7SUFDRCxvQ0FBUSxHQUFSO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQUEsTUFBTTtZQUN6QyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0QsdUNBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUNELHVDQUFXLEdBQVgsVUFBWSxDQUFTLEVBQUUsQ0FBUztRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksMkJBQWEsRUFBRSxDQUFDO1FBQ2xDLElBQUksS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsSUFBSSxD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