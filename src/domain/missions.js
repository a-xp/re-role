import {OP_STATUS, TEAM} from "../api/enum";

export const participantsCount = {
    5:[2,3,2,3,3],
    6:[2,3,4,3,4],
    7:[2,3,3,4,4],
    8:[3,4,4,5,5]
};

export function getScore(missions) {
    return missions.reduce((r, m) => {
        if(m.status === OP_STATUS.FAIL) return {...r, [TEAM.BAD]: 1 + r[TEAM.BAD]};
        if(m.status === OP_STATUS.SUCCESS) return {...r, [TEAM.GOOD]: 1 + r[TEAM.GOOD]};
        return r;
    }, {[TEAM.GOOD]: 0, [TEAM.BAD]: 0});
}

export function getNextLeader(lastId, numPlayers) {
    return lastId < numPlayers-1 ? lastId + 1 : 0;
}
