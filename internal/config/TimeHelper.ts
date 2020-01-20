
export class TimeHelper{

    public static MINIMUM_MINUTES = 3;

    public static readonly ONE_MINUTE = 60 * 1000;

    public static minutesFromNow(minutes:number):Date{
        if (minutes < TimeHelper.MINIMUM_MINUTES) minutes = TimeHelper.MINIMUM_MINUTES;
        return new Date( Date.now() + (minutes * TimeHelper.ONE_MINUTE) );
    }

}