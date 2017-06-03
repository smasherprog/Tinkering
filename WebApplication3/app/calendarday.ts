import * as moment from 'moment'


export class Event {
    public Address = '';
    public Address2 = '';
}
export class CalendarDay{
    public CDay = moment();
    public InMonth = true;

}
export class CalendarWeek {
    public DaysInWeek = new Array<CalendarDay>();
}
export class CalendarMonth {
    public WeeksInMonth = new Array<CalendarWeek>();
    public StartDate = moment();
}


