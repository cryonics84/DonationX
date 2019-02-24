export const StageState = {
    "Waiting": 0,
    'Intro': 1,
    "Login": 2,
    "Pass1": 3,
    "Pass2": 4,
    'getState': (index) => {
        switch(index){
            case 0: return 'Waiting';
            case 1: return 'Intro';
            case 2: return 'Login';
            case 3: return 'Pass1';
            case 4: return 'Pass2';
        }
    }
};

export const Group = {
    "Unknown": 0,
    "Control": 1,
    "Semi": 2,
    "Full": 3
};
