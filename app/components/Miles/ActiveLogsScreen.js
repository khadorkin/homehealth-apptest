import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Divider} from 'react-native-elements';
import SortableList from 'react-native-sortable-list';
import moment from 'moment';
import Modal from 'react-native-modal';
import Toast from 'react-native-easy-toast';
import {borderColor, styles, dotColor} from './styles';
import {
    defaultBackGroundColor,
    detailBackGroundColor,
    ErrorMessageColor,
    PrimaryColor,
    screenNames
} from '../../utils/constants';
import {CustomCheckBox} from '../common/CustomCheckBox';
import SelectDatesPopup from './SelectDatesPopup';
import {isSameMonth} from '../../utils/collectionUtils';
import {renderDot} from '../common/common';
import {SimpleButton} from '../common/SimpleButton';

function DateRowGenerator(toggleDate, navigator) {
    class RenderDateRow extends Component {

        constructor(props) {
            super(props);
            this.state = {
                detailed: false,
                data: props.data,
                rangeStartDate: null,
                rangeEndDate: null,
            };
        }

        getDate = () => (parseInt(this.state.data.date, 10));
        getVisits = () => (this.state.data.visits);
        getComputedMilesForVisit = (visit) => (visit.visitMiles.computedMiles);
        getExtraMilesForVisit = (visit) => visit.visitMiles.extraMiles;
        isSelected = () => (this.props.data.isSelected);

        incrementCounter = () => {
            this.setState({counter: this.state.counter + 1});
            this.props.onItemLayoutUpdate(this.props.key);
        };

        dateAndCheckBoxComponent = () => {
            const date = this.getDate();
            console.log('date comp');
            console.log(this.isSelected())
            return (
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <CustomCheckBox
                        checked={this.isSelected()}
                        checkBoxStyle={{width: 15, height: 15, alignSelf: 'center'}}
                        checkBoxContainerStyle={{width: 40, height: 40, justifyContent: 'center'}}
                        onPress={() => toggleDate(date.toString())}
                    />
                    <View style={{alignItems: 'center'}}>
                        <Text style={styles.miniHeadingStyle}>
                            {moment(date).format('MMM')}
                        </Text>
                        <Text style={styles.miniContentStyle}>
                            {moment(date).format('D')}
                        </Text>
                    </View>
                </View>
            );
        };

        totalMilesComponent = () => {
            const visits = this.getVisits();
            const milesVisits = visits.slice(1);
            let totalMiles = 0;
            let extraMiles = 0;
            let infoPending = false;
            for (let i = 0; i < milesVisits.length; i++) {
                if (this.getComputedMilesForVisit(milesVisits[i])) {
                    totalMiles += this.getComputedMilesForVisit(milesVisits[i]);
                } else {
                    infoPending = true;
                    break;
                }
                if (this.getExtraMilesForVisit(milesVisits[i])) {
                    extraMiles += this.getExtraMilesForVisit(milesVisits[i]);
                }
            }
            const extraMilesSection = (
                <View style={{flexDirection: 'row'}}>
                    <View>
                        <Text>
                            {` +${extraMiles}`}
                        </Text>
                    </View>
                    <View>
                        <Text style={{...styles.miniHeadingStyle, fontSize: 6}}>
                            Extra
                        </Text>
                        <Text style={{...styles.miniHeadingStyle, fontSize: 6}}>
                            mi
                        </Text>
                    </View>
                </View>
            );
            const milesSection = (
                <View>
                    {
                        infoPending ? <Text style={styles.miniContentStyle}>...</Text> :
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={styles.miniContentStyle}>
                                    {totalMiles}
                                </Text>
                                {
                                    !!extraMiles && extraMilesSection
                                }
                            </View>
                    }
                </View>
            );
            return (
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.miniHeadingStyle}>
                        Total Miles
                    </Text>
                    {milesSection}
                </View>
            );
        };

        totalVisitsComponent = () => {
            const visits = this.getVisits();
            return (
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={styles.miniHeadingStyle}>
                        Total Visits:
                    </Text>
                    <Text style={styles.miniContentStyle}>
                        {visits.length}
                    </Text>
                </View>
            );
        };

        // TODO Include this
        renderDottedLine = () => (
            // TODO Make this cleaner
            <View>
                {
                    [1, 2, 3, 4].map(i => renderDot(dotColor, {margin: 1}))
                }
            </View>
        );

        renderSingleVisit = (visit, isFirstVisit) => {
            return (
                <View style={{flex: 1, alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', margin: 5}}>

                    <Text style={{...styles.textStyle, marginLeft: 10}}>
                        {visit.getAssociatedName()}
                    </Text>
                    {
                        !isFirstVisit &&
                        <View style={{flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center'}}>
                            <Text style={styles.textStyle}>
                                {
                                    this.getComputedMilesForVisit(visit) ? this.getComputedMilesForVisit(visit) : '...'
                                }
                            </Text>
                            {
                                !!this.getExtraMilesForVisit(visit) &&
                                <Text style={{...styles.textStyle, fontSize: 10}}>
                                    {`+${this.getExtraMilesForVisit(visit)} mi`}
                                </Text>
                            }
                        </View>
                    }

                </View>
            );
        };

        handleReviewClick = () => {
            navigator.push({
                    screen: screenNames.visitDayViewScreen,
                    passProps: {
                        selectedScreen: 'list',
                        date: this.getDate()
                    }
                }
            );
        };

        reviewSection = () => {
            const visits = this.getVisits();
            const notAllVisitsDone = visits.some(visit => !visit.isDone);
            if (notAllVisitsDone) {
                return (
                    <View style={{flex: 1, flexDirection: 'row', borderTopColor: borderColor, borderTopWidth: 1, padding: 15, alignItems: 'center'}}>
                        <Text style={{flex: 3, color: ErrorMessageColor, fontSize: 9, marginLeft: 10, marginRight: 10}}>
                            * Some miles are not counted for this day. Review and mark visits as 'Done' or 'Delete' them
                        </Text>
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={this.handleReviewClick}>
                                <View style={{borderColor: PrimaryColor, borderWidth: 1, borderRadius: 3, padding: 3}}>
                                    <Text style={{...styles.textStyle, color: PrimaryColor}}>
                                        Re
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }
        };

        commentsSection = () => {
            const visits = this.getVisits();
            let commentsString = '';
            for (let i = 0; i < visits.length; i++) {
                if (visits[i].visitMiles.milesComments) {
                    commentsString += `Visit-${i + 1}: ${visits[i].visitMiles.milesComments}; `;
                }
            }
            if (commentsString) {
                return (
                    <View style={{borderTopColor: borderColor, borderTopWidth: 1, flexDirection: 'row', padding: 15, paddingBottom: 5}}>
                        <Text style={styles.miniHeadingStyle}>
                            Comments:
                        </Text>
                        <Text style={{...styles.miniContentStyle, fontSize: 10, marginRight: 10, flex: 1, flexWrap: 'wrap'}}>
                            {commentsString}
                        </Text>
                    </View>
                );
            }
        }

        getDetailedVisitsComponent = () => {
            const visits = this.getVisits();
            const isFirstVisit = (visit) => (visits[0].visitID === visit.visitID);
            return (
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 1}} />
                        <View style={{flex: 4}}>
                            {visits.map(visit => this.renderSingleVisit(visit, isFirstVisit(visit)))}
                        </View>
                        <View style={{flex: 1}} />
                    </View>
                    {this.reviewSection()}
                    {this.commentsSection()}
                </View>
            );
        };

        toggleDetailView = () => {
            this.setState({detailed: !this.state.detailed});
            this.props.onItemLayoutUpdate(this.state.data.date);
        };

        render() {
            return (
                <View style={{flex: 1, marginBottom: 5, marginTop: 5}}>
                    <TouchableOpacity onPress={this.toggleDetailView}>
                        <View style={{flexDirection: 'row', flex: 1}}>
                            {
                               this.dateAndCheckBoxComponent()
                            }
                            {
                                this.totalMilesComponent()
                            }
                            {
                                this.totalVisitsComponent()
                            }
                        </View>
                        {
                            this.state.detailed &&
                                <View style={{flex: 1, flexDirection: 'row', backgroundColor: detailBackGroundColor, borderTopColor: borderColor, borderTopWidth: 1}}>
                                    <View style={{flex: 1, marginTop: 10, marginBottom: 10}}>
                                        {
                                            this.getDetailedVisitsComponent()
                                        }
                                    </View>
                                </View>
                        }
                    </TouchableOpacity>
                    <Divider style={{...styles.dividerStyle}} />
                </View>
            );
        }
    }
    return (RenderDateRow);
}

export default class ActiveLogsScreen extends Component {

    constructor(props) {
        super(props);
        console.log('in constructor');
        const {order, formattedData} = this.getOrderAndFormattedData(this.props.data, this.props.selectedDatesSet);
        this.state = {
            order,
            formattedData,
            showSelectDatesModal: false
        };
        this.renderRow = DateRowGenerator(this.props.toggleDateSelected, this.props.navigator);
    }


    componentWillReceiveProps(nextProps) {
        if (this.props.selectedDatesSet !== nextProps.selectedDatesSet) {
            const {order, formattedData} = this.getOrderAndFormattedData(this.props.data, nextProps.selectedDatesSet);
            this.setState({order, formattedData});
        }
    }

    getOrderAndFormattedData = (dataArray, selectedDatesSet) => {
        const formattedData = {};
        const order = [];
        dataArray.forEach((item) => { item.isSelected = selectedDatesSet.has(item.date); formattedData[item.date] = item; order.push(item.date); });
        order.sort();
        return {formattedData, order};
    };


    onPressSelectDates = () => {
        this.setState({showSelectDatesModal: true});
    };

    dismissDatesModal = () => {
        this.setState({showSelectDatesModal: false});
    };

    setDatesRange = (startDate, endDate) => {
        this.setState({
            rangeStartDate: startDate,
            rangeEndDate: endDate
        });
        this.props.selectDatesInRange(startDate, endDate);
    };


    getRangeDateString = () => {
        const {rangeStartDate, rangeEndDate} = this.state;
        if (rangeStartDate && rangeEndDate) {
            let start;
            if (isSameMonth(rangeStartDate, rangeEndDate)) {
                start = moment(rangeStartDate).format('DD');
            } else {
                start = moment(rangeStartDate).format('DD-MMM');
            }
            const end = moment(rangeEndDate).format('DD-MMM');
            return `${start} - ${end}`;
        }
        return '';
    };

    filterSection = () => {
        const allDates = Object.keys(this.state.formattedData);
        const areAllSelected = allDates.every(date => this.props.selectedDatesSet.has(date));
        const rangeDateString = this.getRangeDateString();
        return (
            <View style={{flexDirection: 'row', borderBottomColor: borderColor, borderBottomWidth: 1, alignItems: 'center'}}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <CustomCheckBox
                        checked={areAllSelected}
                        checkBoxStyle={{width: 15, height: 15, alignSelf: 'center'}}
                        checkBoxContainerStyle={{width: 40, height: 30, justifyContent: 'center', marginBottom: 0}}
                        onPress={() => this.props.toggleSelectAll(areAllSelected)}
                    />
                    <Text>
                        Select All
                    </Text>
                </View>
                <View style={{flex: 1, paddingLeft: 20, flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{...styles.textStyle, color: PrimaryColor}}>
                        Dates
                    </Text>
                    <TouchableOpacity onPress={() => { this.onPressSelectDates(); }}>
                        <Modal
                            isVisible={this.state.showSelectDatesModal}
                            onBackButtonPress={this.dismissDatesModal}
                            dismissDatesModal={this.dismissDatesModal}
                            avoidKeyboard
                            backdropOpacity={0.8}
                        >
                            <SelectDatesPopup
                                dismissModal={this.dismissDatesModal}
                                setDates={this.setDatesRange}
                                startDate={this.state.rangeStartDate}
                                endDate={this.state.rangeEndDate}
                            />
                        </Modal>
                        <View style={{borderBottomColor: borderColor, borderBottomWidth: 1, marginLeft: 10, paddingLeft: 3, paddingRight: 3, minWidth: 40}}>
                            <Text style={{...styles.textStyle, fontSize: 9}}>
                                {rangeDateString}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    handleCreateReportClick = () => {
        const actionRequiredMessage = 'Some miles are not counted in the report. Review  and mark visits as \'Done\' or \'Delete\' them.'
        console.log(Object.keys(this.refs));
        this.refs.toast.show(actionRequiredMessage, 5000);
    };

    render() {
        return (
            <View style={{flex: 1, backgroundColor: defaultBackGroundColor}}>
                {
                    this.filterSection()
                }
                <View style={{marginTop: 5, flex: 1}}>
                    <SortableList
                        data={this.state.formattedData}
                        order={this.state.order}
                        renderRow={this.renderRow}
                    />
                </View>
                <SimpleButton
                    title='Create Report'
                    onPress={this.handleCreateReportClick}
                    style={{height: 50}}
                />
                <Toast
                    ref='toast'
                    position='bottom'
                    style={styles.toastStyle}
                    textStyle={styles.toastTextStyle}
                    fadeInDuration={50}
                    fadeOutDuration={300}
                    positionValue={220}
                />
            </View>
        );
    }
}
