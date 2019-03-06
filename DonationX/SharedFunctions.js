export const StageState = {
    "Waiting1": 0,
    'Intro': 1,
    "Login": 2,
    "Pass1": 3,
    "Pass2": 4,
    "AfterPass1": 5,
    "AfterPass2": 6,
    "BeforePass2": 7,
    "Waiting2": 8,
    'getState': (index) => {
        switch(index){
            case 0: return 'Waiting For Start';
            case 1: return 'Intro';
            case 2: return 'Login';
            case 3: return 'Pass1';
            case 4: return 'Pass2';
            case 5: return 'AfterPass1';
            case 6: return 'AfterPass2';
            case 7: return 'BeforePass2';
            case 8: return 'Waiting For Group';
        }
    }
};

export const Group = {
    "Unknown": 0,
    "Control": 1,
    "Semi": 2,
    "Full": 3,
    'getGroupName': (index) => {
        switch (index) {
            case 0:
                return 'Unknown';
            case 1:
                return 'Control';
            case 2:
                return 'Semi';
            case 3:
                return 'Full';
        }
    }
};
