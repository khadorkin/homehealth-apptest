import React from 'react';
import {View, FlatList} from 'react-native';
import {SearchBar} from 'react-native-elements';
import {Tag} from '../common/tag';
import EmptyStateButton from '../common/EmptyStateButton';
import {SimpleButton} from '../common/SimpleButton';
import StyledText from '../common/StyledText';

//TODO improve efficiency
//TODO mark the places already selected for visit as such
//
// function _createListItemComponent(item, onItemToggle) {
//     const avatar = item.type === 'patient' ? require('../../../resources/ic_fiber_pin_2x.png') : require('../../../resources/ic_location_on_black_24dp.png');
//     const rightIcon = item.isSelected ? {name: 'check'} : {name: 'ac-unit'};
//     console.log([item.type + item.id, item.name, item.address, avatar, rightIcon, onItemToggle].join(', '));
//     return (
//         <ListItem
//             key={item.key}
//             title={item.name}
//             subtitle={item.address}
//             avatar={avatar}
//             rightIcon={rightIcon}
//             onPressRightIcon={() => onItemToggle(item)}
//         />
//     );
// }

function getComponentToDisplayBasedOnProps(props) {
    if (props.isZeroState) {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <StyledText
                    style={{
                        fontWeight: '300',
                        fontSize: 20,
                        color: 'grey'
                    }}
                >Let's get you started</StyledText>

                <StyledText
                    style={{
                        textAlign: 'center',
                        padding: 0,
                        margin: 20,
                        marginTop: 5,
                        fontSize: 14,
                        color: 'grey'
                    }}
                >
                    Add Patients to get started. Adding Patients will allow you to Add Visits
                </StyledText>
                <EmptyStateButton
                    onPress={props.onPressAddPatient}
                >
                    Add Patient
                </EmptyStateButton>
            </View>
        );
    }

    this.getTags = function () {
        if (props.selectedItems.length > 0) {
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginLeft: 16,
                        marginRight: 16,
                        marginTop: 4,
                        borderBottomWidth: 1,
                        borderColor: '#aaaaaa',
                        paddingBottom: 4
                    }}
                >
                    {props.selectedItems.map((item) => <Tag
                        text={item.name}
                        onPress={() => props.onTagPress(item)}
                    />)}
                </View>
            );
        }
        return (
            <View />
        );
    };

    return (
        <View style={{flex: 1}}>
            <SearchBar
                lightTheme
                placeholder='Search patients and stops'
                value={props.searchText}
                onChangeText={props.onChangeText}
                containerStyle={{backgroundColor: '#f8f8f8', borderBottomWidth: 0, borderTopWidth: 0}}
                inputStyle={{backgroundColor: 'white', color: 'black'}}
                clearIcon={{color: '#dddddd', name: 'cancel'}}
            />
            {this.getTags()}
            <FlatList
                onRefresh={props.onRefresh}
                refreshing={props.refreshing}
                data={props.listItems}
                renderItem={props.renderItem}
            />
        </View>
    );
}

function AddVisitsScreen(props) {
    //TODO theres inconsistencies in whether the button lable is in caps or not
    return (
        <View style={{flex: 1, backgroundColor: '#ffffff'}}>
            {getComponentToDisplayBasedOnProps(props)}
            <SimpleButton
                title='Done'
                onPress={props.onDone}
                style={{height: 50}}
            />
        </View>
    );
}

export {AddVisitsScreen};
