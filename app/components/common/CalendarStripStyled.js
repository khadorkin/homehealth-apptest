import React from 'react';
import CalendarStrip from 'react-native-calendar-strip';
import {PrimaryColor, PrimaryFontFamily} from '../../utils/constants';
import {todayMomentInUTCMidnight} from '../../utils/utils';

function CalendarStripStyled(props) {
    const selectedDateRadius = 40;
    const radius = {
        borderRadius: undefined,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: props.noRounding ? 0 : selectedDateRadius,
        borderTopRightRadius: props.noRounding ? 0 : selectedDateRadius
    };

    return (
        <CalendarStrip
            style={[{flex: 1, paddingTop: props.paddingTop, backgroundColor: 'white'}, props.dateRowAtBottom ? {justifyContent: 'flex-end'} : {justifyContent: 'center'}, props.style]}
            innerStyle={{flex: undefined}}
            calendarHeaderViewStyle={{marginLeft: 40, marginBottom: 10}}
            calendarHeaderStyle={{fontSize: 24, alignSelf: 'flex-start', fontFamily: PrimaryFontFamily}}
            datesStripStyle={[{flex: undefined}, props.dateRowAtBottom ? {alignItems: 'flex-end'} : null]}
            dateNumberStyle={{fontSize: 18, fontWeight: undefined}}
            iconContainer={{flex: 1, opacity: 0.2}}
            calendarDatesStyle={{flex: 8}}
            dateNameStyle={{fontSize: 12, color: '#cccccc'}}
            onDateSelected={props.onDateSelected}
            selectedDate={props.date}
            startingDate={props.date}
            showMonth={props.showMonth}
            styleWeekend={false}
            calendarHeaderFormat='MMMM'
            customDatesStyles={[
                {
                    startDate: props.date.valueOf(),
                    dateContainerStyle: {backgroundColor: PrimaryColor, ...radius},
                    dateNameStyle: {color: 'white'},
                    dateNumberStyle: {color: 'white'},
                },
                {
                    startDate: todayMomentInUTCMidnight(),
                    dateNameStyle: {color: PrimaryColor},
                    dateNumberStyle: {color: PrimaryColor},
                }
            ]}
        />
    );
}

export {CalendarStripStyled};

