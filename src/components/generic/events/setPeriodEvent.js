function getCurrentPeriodEvent() {
    const forcedEvent = localStorage.getItem("forcedPeriodEvent");
    if (forcedEvent) {
        return forcedEvent;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const periodEventDateTimes = {
        christmas: {
            name: 'christmas',
            start: new Date(today.getFullYear(), 11, 1, 0, 0, 0),
            end: new Date(today.getFullYear(), 11, 31, 0, 0, 0)
        },
        easter: {
            name: 'easter',
            start: new Date(today.getFullYear(), 3, 1, 0, 0, 0),
            end: new Date(today.getFullYear(), 3, 30, 0, 0, 0)
        }
    };

    let matchingEvent = "none";

    Object.values(periodEventDateTimes).forEach(period => {
        if (today >= period.start && today <= period.end) {
            matchingEvent = period.name;
        }
    });

    return matchingEvent; // Return the matching event
}

export const currentPeriodEvent = getCurrentPeriodEvent();