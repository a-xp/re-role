import {GAME_TYPE, TEAM} from "../api/enum";
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
    UNKNOWN: 'UNKNOWN'
};

export const roleTraits = {
    [ROLES.ASSASSIN]: {side: TEAM.BAD, title: 'the Assassin', icon: assassinIcon},
    [ROLES.FALSE_COMMANDER]: {side: TEAM.BAD, title: 'the false Commander', icon: falseCommanderIcon},
    [ROLES.SPY]: {side: TEAM.BAD, title: 'a government spy', icon: spyIcon},
    [ROLES.COMMANDER]: {side: TEAM.GOOD, title: 'the Commander', icon:commanderIcon},
    [ROLES.BODY_GUARD]: {side: TEAM.GOOD, title: 'the Body Guard', icon:bodyGuardIcon},
    [ROLES.RESISTANCE]: {side: TEAM.GOOD, title: 'a member of the Resistance', icon:resistanceIcon},
    [ROLES.UNKNOWN]: {icon: anonymousIcon}
};


function assignClassicRoles(playersPrefSide) {
    const teams = splitTeams(playersPrefSide);
    const result = Array(playersPrefSide.length).fill(ROLES.RESISTANCE);
    teams[TEAM.BAD].forEach(i => result[i] = ROLES.SPY);
    return result;
}

function assignAvalonRoles(playersPrefSide) {
    const teams = splitTeams(playersPrefSide);
    const result = Array(playersPrefSide.length).fill(ROLES.RESISTANCE);
    const good = shuffle(teams[TEAM.GOOD]);
    const bad = shuffle(teams[TEAM.BAD]);
    result[good[0]] = ROLES.COMMANDER;
    result[good[1]] = ROLES.BODY_GUARD;
    result[bad[0]] = ROLES.ASSASSIN;
    result[bad[1]] = ROLES.FALSE_COMMANDER;
    bad.slice(2).forEach(i => result[i] = ROLES.SPY);
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
    5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 6
};

function getClassicRoleVision(ownRole, visionRole) {
    return ownRole === ROLES.SPY ? visionRole : ROLES.UNKNOWN;
}

function getAvalonRoleVision(ownRole, visionRole) {
    switch (ownRole) {
        case ROLES.SPY:
        case ROLES.FALSE_COMMANDER:
        case ROLES.ASSASSIN: return roleTraits[visionRole].side === TEAM.GOOD ? ROLES.RESISTANCE : visionRole;
        case ROLES.BODY_GUARD: return visionRole === ROLES.COMMANDER || visionRole === ROLES.FALSE_COMMANDER ? ROLES.COMMANDER : ROLES.UNKNOWN;
        case ROLES.COMMANDER: return roleTraits[visionRole].side === TEAM.GOOD ? ROLES.RESISTANCE : ROLES.SPY;
        default: return ROLES.UNKNOWN;
    }
}

export const assignRoles = {
        [GAME_TYPE.CLASSIC]: assignClassicRoles,
        [GAME_TYPE.AVALON]: assignAvalonRoles
    };

export const getRoleVision = {
        [GAME_TYPE.CLASSIC]: getClassicRoleVision,
        [GAME_TYPE.AVALON]: getAvalonRoleVision
    };