import {OP_STATUS, TEAM, VOTE} from "../api/enum";
import {bots} from "./bots";
import Sentencer from "sentencer";

export const participantsCount = {
    5:[2,3,2,3,3],
    6:[2,3,4,3,4],
    7:[2,3,3,4,4],
    8:[3,4,4,5,5],
    9:[3,4,4,5,5],
    10:[3,4,4,5,5],
    11:[3,4,4,6,5]
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

export function createMission(prev, members) {
    const num = prev ? (prev.status === OP_STATUS.REJECTED ? prev.num : prev.num + 1) : 0;
    const leader = prev ? getNextLeader(prev.leader, members.length) : Math.floor(Math.random() * members.length);
    const participants = members[leader].bot ? bots.proposeTeam(members, leader, num) : [];
    const status = members[leader].bot ? OP_STATUS.VOTE : OP_STATUS.PREPARE;

    return {num, leader, participants, vote: [], status, name: Sentencer.make('{{adjective}} {{noun}}')};
}

export function calcVotesMajority(votes, roomSize) {
    const summary = Object.values(votes).reduce((r, vote) => ({...r, [vote]: 1 + r[vote]}), {[VOTE.YES]: 0, [VOTE.NO]:0});
    if(summary[VOTE.YES] + summary[VOTE.NO] === roomSize) {
        return summary[VOTE.YES] > summary[VOTE.NO] ? OP_STATUS.PROGRESS : OP_STATUS.REJECTED;
    }else{
        return false;
    }
}