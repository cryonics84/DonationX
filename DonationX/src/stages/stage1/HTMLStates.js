import * as header from './header.html'
import * as stateLogin from './stateLogin.html'

import * as control1 from './control1.html'
import * as control2 from './control2.html'

import * as semi1 from './semi1.html'
import * as semi2 from './semi2.html'

import * as full1 from './full1.html'
import * as full2 from './full2.html'

import { StageState, Group } from '../../../SharedFunctions';

export const HTMLStates = {
    header: header,
    stateLogin: stateLogin,
    control1: control1,
    control2: control2,
    semi1: semi1,
    semi2: semi2,
    full1: full1,
    full2: full2
};


export function getHTMLFromStateGroup(state, group){
    console.log('Getting HTML for State: ' + state + ', group: ' + group);
    //Login and waiting are shared among all types
    switch(state){
        case StageState.Login:
            console.log('Getting HTML for Login...');
            return stateLogin;
        case StageState.Waiting:
            console.log('Getting HTML for Waiting...');
            return Waiting;
    }

    switch(group){
        case Group.Unknown:
            console.log('Group Unknown!');
            return null;
        case Group.Control:
            return getStateFromControl(state);
            break;
        case Group.Semi:
            return getStateFromSemi(state);
            break;
        case Group.Full:
            return getStateFromFull(state);
            break;
        default: 
            console.log('Something went wrong.. Group unlisted!!');
            return null;
    }
}


function getStateFromControl(state){
    switch(state){
        case StageState.Pass1:
            console.log('Getting HTML for Control Pass 1');
            return HTMLStates.control1;
        case StageState.Pass2:
            console.log('Getting HTML for Control Pass 2');
            return HTMLStates.control2;
    }
}

function getStateFromSemi(state){
    switch(state){
        case StageState.Pass1:
            console.log('Getting HTML for Semi Pass 1');
            return HTMLStates.semi1;
        case StageState.Pass2:
            console.log('Getting HTML for Semi Pass 2');
            return HTMLStates.semi2;
    }
}

function getStateFromFull(state){
    switch(state){
        case StageState.Pass1:
            console.log('Getting HTML for Full Pass 1');
            return HTMLStates.full1;
        case StageState.Pass2:
            console.log('Getting HTML for Full Pass 2');
            return HTMLStates.full2;
    }
}
