import * as header from './header.html'
import * as stateLogin from './stateLogin.html'

import * as pass1control from './pass1control.html'
import * as pass1semi from './pass1semi.html'

import * as control2 from './control2.html'

import * as semi2 from './semi2.html'

import * as full2 from './full2.html'

import * as afterPass1 from './afterPass1.html'
import * as afterPass2 from './afterPass2.html'

import * as beforePass2 from './beforePass2.html'

import * as waiting from './stateWaiting.html'

import { StageState, Group } from '../../../SharedFunctions';

export const HTMLStates = {
    header: header,
    stateLogin: stateLogin,
    pass1control: pass1control,
    pass1semi: pass1semi,
    beforePass2: beforePass2,
    waiting: waiting,
    control2: control2,
    semi2: semi2,
    full2: full2
};


export function getHTMLFromStateGroup(state, group){
    console.log('Getting HTML for State: ' + state + ', group: ' + group);
    //Login and waiting are shared among all types
    switch(state){
        case StageState.Login:
            console.log('Getting HTML for Login...');
            return stateLogin;
        case StageState.Waiting1:
            console.log('Getting HTML for Waiting...');
            return waiting;
        case StageState.Waiting2:
            console.log('Getting HTML for Waiting...');
            return waiting;
            return pass1control;
        case StageState.AfterPass1:
            console.log('Getting HTML for After Pass 1...');
            return afterPass1;
        case StageState.AfterPass2:
            console.log('Getting HTML for After Pass 2...');
            return afterPass2;
        case StageState.BeforePass2:
            console.log('Getting HTML for Before Pass 2...');
            return beforePass2;
    }

    if(state === StageState.Pass1){

        switch(group){
            case Group.Unknown:
                console.log('Group Unknown!');
                return null;
            case Group.Control:
                return HTMLStates.pass1control;
            case Group.Semi:
                return HTMLStates.pass1semi;
            case Group.Full:
                return HTMLStates.pass1semi;
            default:
                console.log('Something went wrong.. Group unlisted!!');
                return null;
        }
    }
    else if(state === StageState.Pass2){

        switch(group){
            case Group.Unknown:
                console.log('Group Unknown!');
                return null;
            case Group.Control:
                return HTMLStates.control2;
            case Group.Semi:
                return HTMLStates.semi2;
            case Group.Full:
                return HTMLStates.full2;
            default:
                console.log('Something went wrong.. Group unlisted!!');
                return null;
        }
    }
}