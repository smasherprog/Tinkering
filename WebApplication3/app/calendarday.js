"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var Event = (function () {
    function Event() {
        this.Address = '';
        this.Address2 = '';
    }
    return Event;
}());
exports.Event = Event;
var CalendarDay = (function () {
    function CalendarDay() {
        this.CDay = moment();
        this.InMonth = true;
    }
    return CalendarDay;
}());
exports.CalendarDay = CalendarDay;
var CalendarWeek = (function () {
    function CalendarWeek() {
        this.DaysInWeek = new Array();
    }
    return CalendarWeek;
}());
exports.CalendarWeek = CalendarWeek;
var CalendarMonth = (function () {
    function CalendarMonth() {
        this.WeeksInMonth = new Array();
        this.StartDate = moment();
    }
    return CalendarMonth;
}());
exports.CalendarMonth = CalendarMonth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXJkYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYWxlbmRhcmRheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFnQztBQUdoQztJQUFBO1FBQ1csWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLGFBQVEsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUFELFlBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUhZLHNCQUFLO0FBSWxCO0lBQUE7UUFDVyxTQUFJLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDaEIsWUFBTyxHQUFHLElBQUksQ0FBQztJQUUxQixDQUFDO0lBQUQsa0JBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGtDQUFXO0FBS3hCO0lBQUE7UUFDVyxlQUFVLEdBQUcsSUFBSSxLQUFLLEVBQWUsQ0FBQztJQUNqRCxDQUFDO0lBQUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUZZLG9DQUFZO0FBR3pCO0lBQUE7UUFDVyxpQkFBWSxHQUFHLElBQUksS0FBSyxFQUFnQixDQUFDO1FBQ3pDLGNBQVMsR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQUQsb0JBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUhZLHNDQUFhIn0=