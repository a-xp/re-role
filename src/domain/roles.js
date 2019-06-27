import {TEAM} from "../api/enum";
import resistanceIcon from './icons/soldier.svg';
import spyIcon from './icons/secret-agent.svg';
import anonymousIcon from './icons/anonymous.svg';
import commanderIcon from './icons/captain.svg';
import falseCommanderIcon from './icons/captain-red.svg';
import assassinIcon from  './icons/ninja.svg';
import bodyGuardIcon from './icons/bodyguard.svg';

export const ROLES = {
    RESISTANCE: 'RESISTANCE',
    SPY: 'SPY',
    BODY_GUARD: 'BODY_GUARD',
    COMMANDER: 'COMMANDER',
    FALSE_COMMANDER: 'FALSE_COMMANDER',
    ASSASSIN: 'ASSASSIN',
    UNKNOWN: 'UNKNOWN',
    SPY_DEFECTOR: 'SPY_DEFECTOR',
    DEFECTOR: 'DEFECTOR',
    DEEP_COVER_SPY: 'DEEP_COVER_SPY',
    BLIND_SPY: 'BLIND_SPY'
};

export const roleTraits = {
    [ROLES.ASSASSIN]: {id: ROLES.ASSASSIN, side: TEAM.BAD, title: 'Assassin', icon: assassinIcon, core: true},
    [ROLES.FALSE_COMMANDER]: {id: ROLES.FALSE_COMMANDER, side: TEAM.BAD, title: 'False Commander', icon: falseCommanderIcon, info: 'Appears as Commander'},
    [ROLES.SPY]: {id: ROLES.SPY, side: TEAM.BAD, title: 'Government spy', icon: spyIcon, base: true},
    [ROLES.COMMANDER]: {id: ROLES.COMMANDER, side: TEAM.GOOD, title: 'Commander', icon:commanderIcon, core: true, info: 'Knows spies'},
    [ROLES.BODY_GUARD]: {id: ROLES.BODY_GUARD, side: TEAM.GOOD, title: 'Bodyguard', icon:bodyGuardIcon, info: 'Knows commanders'},
    [ROLES.RESISTANCE]: {id: ROLES.RESISTANCE, side: TEAM.GOOD, title: 'Member of the Resistance', icon:resistanceIcon, base: true},
    [ROLES.UNKNOWN]: {id: ROLES.UNKNOWN, icon: anonymousIcon},
    [ROLES.SPY_DEFECTOR]: {id:ROLES.SPY_DEFECTOR, side:TEAM.BAD, title: 'Spy Defector', icon: spyIcon, info: 'Might switch side'},
    [ROLES.DEFECTOR]: {id: ROLES.DEFECTOR, side: TEAM.GOOD, title: 'Defector', icon: resistanceIcon, info: 'Might switch side'},
    [ROLES.DEEP_COVER_SPY]: {id: ROLES.DEEP_COVER_SPY, side: TEAM.BAD, title: 'Deep cover Spy', icon: spyIcon, info: 'Unknown to Commander'},
    [ROLES.BLIND_SPY]: {id: ROLES.BLIND_SPY, side: TEAM.BAD, title: 'Blind Spy', icon: spyIcon, info: 'Unknown to other spies'}
};

export const teamTraits = {
  [TEAM.BAD]: {color: 'spy text', title: 'The Spies', success: ['3 Missions fail', 'Commander named by the Assassin']},
  [TEAM.GOOD]: {color: 'resistance text', title: 'The Resistance', success: ['3 Missions are completed successfully'], fail: ['Commander named by the Spies']}
};

export function assignRoles(playersPrefSide, gameRoles) {
    const teams = splitTeams(playersPrefSide);
    const result = Array(playersPrefSide.length);
    const good = shuffle(teams[TEAM.GOOD]);
    const bad = shuffle(teams[TEAM.BAD]);
    [...gameRoles.filter(r => roleTraits[r].core), ...shuffle(gameRoles.filter(r => !roleTraits[r].core))].forEach(r => {
        if(roleTraits[r].side === TEAM.GOOD && good.length){
            result[good.shift()] = r;
        }else if(roleTraits[r].side === TEAM.BAD && bad.length){
            result[bad.shift()] = r;
        }
    });
    while(good.length>0){
        result[good.shift()] = ROLES.RESISTANCE;
    }
    while(bad.length>0){
        result[bad.shift()] = ROLES.SPY;
    }
    return result;
}

function splitTeams(playersPrefSide) {
    const teams = playersPrefSide.reduce( (result, side, i) => ({...result, [side]: [...result[side], i]}), {
        [TEAM.BAD]: [],
        [TEAM.GOOD]: [],
        [TEAM.RANDOM]: []
    });
    const players = [...shuffle(teams[TEAM.GOOD]), ...shuffle(teams[TEAM.RANDOM]), ...shuffle(teams[TEAM.BAD])];
    return {
        [TEAM.BAD]: players.slice(teamSize[players.length]),
        [TEAM.GOOD]: players.slice(0, teamSize[players.length])
    }
}


function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

const teamSize = {
    5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 6, 11: 7
};

export function getRoleVision(ownRole, visionRole) {
    switch (ownRole) {
        case ROLES.SPY:
        case ROLES.FALSE_COMMANDER:
        case ROLES.ASSASSIN:
        case ROLES.DEEP_COVER_SPY:
            return roleTraits[visionRole].side === TEAM.GOOD ? ROLES.RESISTANCE : ROLES.SPY;
        case ROLES.BODY_GUARD: return visionRole === ROLES.COMMANDER || visionRole === ROLES.FALSE_COMMANDER ? ROLES.COMMANDER : ROLES.UNKNOWN;
        case ROLES.COMMANDER:
            if(visionRole === ROLES.DEEP_COVER_SPY) return ROLES.RESISTANCE;
            return roleTraits[visionRole].side === TEAM.GOOD ? ROLES.RESISTANCE : ROLES.SPY;
        default: return ROLES.UNKNOWN;
    }
}

export function getDefectorTurns(roles){
    return roles.filter(r => r===ROLES.SPY_DEFECTOR || r===ROLES.DEFECTOR).length === 2 ? [
        Math.ceil(Math.random()*7), Math.ceil(Math.random()*7)
    ] : [];
}

export function makeDefectorSwap(members){
    return members.map(m => {
        if(m.role === ROLES.DEFECTOR) return {...m, role: ROLES.SPY_DEFECTOR};
        if(m.role === ROLES.SPY_DEFECTOR) return {...m, role: ROLES.DEFECTOR};
        return m;
    })
}