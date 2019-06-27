import db from '../firebase';
import {OP_STATUS, STATUS, TEAM, VOTE} from "./enum";
import {assignRoles, getDefectorTurns, makeDefectorSwap, ROLES, roleTraits} from "../domain/roles";
import {calcVotesMajority, createMission, getNextLeader, getScore, participantsCount} from "../domain/missions";
import {bots} from "../domain/bots";

async function create(type, login, prefSide) {
    const secret = makeSecret();
    const ref = await db.collection('rooms').add(
        {
            members: [
                {login, prefSide, host: true, secret}
            ],
            status: STATUS.NEW
        }
    );
    return {
        roomId: ref.id, secret, login
    };
}

async function join(id, login, prefSide) {
    const roomRef = db.collection('rooms').doc(id);
    const secret = makeSecret();
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        if(!roomDoc.exists){
            throw new Error("Room not found");
        }
        const room = roomDoc.data();
        if(room.members.some(m => m.login === login)){
            throw new Error("Login is in use");
        }
        if(room.status !== STATUS.NEW){
            throw new Error("The game has been started");
        }
        transaction.update(roomRef, {...room, members: [...room.members, {login, prefSide, secret}]});
    });
    return {
        roomId: id, login, secret
    };
}

async function addBot(roomId){
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        if(room.status === STATUS.NEW && room.members.length < 11){
            const bot = bots.createBot();
            transaction.update(roomRef, {...room, members: [...room.members, bot]});
        }
    });
}

async function login(cred) {
    const {roomId, login, secret} = cred;
    const roomRef = db.collection('rooms').doc(roomId);
    const room = await roomRef.get();
    if(room.exists){
        const user = room.get('members').find(m => m.login === login && m.secret === secret);
        if(user){
            return true;
        }else{
            return Promise.reject(Error('Invalid credentials'))
        }
    }else{
        return Promise.reject(Error('Room not found'))
    }
}

async function start(roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        const numPlayers = room.members.length;
        if(numPlayers < 5 || numPlayers > 11){
            throw new Error("Number of players should be between 5 and 11");
        }
        if(room.status === STATUS.NEW){
            const roles = assignRoles(room.members.map(m => m.prefSide), room.roles);
            const defectorTurn = getDefectorTurns(roles);
            const newMembers = room.members.map( (m,i) => ({...m, team: roleTraits[roles[i]].side, role: roles[i], originalRole: roles[i]}));
            const mission = createMission(null, newMembers);
            const newRoom = {...room, members: newMembers, status: STATUS.STARTED, missions:[mission],
                defectorTurn, score:{[TEAM.BAD]:0, [TEAM.GOOD]:0}};
            transaction.update(roomRef, newRoom);
        }
    });
}

async function end(roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        transaction.update(roomRef, {...room, status: STATUS.FINISHED});
    })
}

async function kick(login, roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        if(room.status === STATUS.NEW) {
            const kicked = room.members.find(m => m.login === login);
            if(kicked){
                const newMembers = room.members.filter( m => m.login !== login);
                if(kicked.host && newMembers.length){
                    newMembers[0].host = true;
                }
                transaction.update(roomRef, {...room, members: newMembers});
            }
        }
    })
}

async function setRoles(roomId, roles) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        if (room.status === STATUS.NEW) {
            transaction.update(roomRef, {...room, roles});
        }
    });
}

async function updateCurrentMission(roomId, mutator) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        if (room.status === STATUS.STARTED) {
            const mission = mutator(room.missions[room.missions.length-1], room);
            transaction.update(roomRef, {...room, missions: [...room.missions.slice(0, room.missions.length-1),
                    mission]});
        }
    });
}

async function proposeTeam(roomId) {
    await updateCurrentMission(roomId, (mission, room) => {
        const numParticipants = participantsCount[room.members.length][mission.num];
        if(numParticipants === mission.participants.length){
            return {...mission, status: OP_STATUS.VOTE}
        }else{
            return mission;
        }
    })
}

async function voteTeam(roomId, playerNum, resolution) {
    await updateCurrentMission(roomId, (mission, room) => {
        if(!mission.vote[playerNum]){
            let newVote = {...mission.vote, [playerNum]: resolution};
            if(room.members[playerNum].host){
                newVote = bots.vote(room.members, newVote, resolution);
            }
            const result = calcVotesMajority(newVote, room.members.length);
            if(result){
                return {...mission, status: result, vote: newVote}
            }else{
                return {...mission, vote: newVote}
            }
        }else{
            return mission;
        }
    })
}

function makeSecret(){
    return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

function listenRoom(id, cb) {
    return db.collection('rooms').doc(id).onSnapshot(cb);
}

async function nextMission(roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        if(room.status === STATUS.STARTED) {
            const lastMission = room.missions[room.missions.length-1];
            const score = getScore(room.missions);
            if(score[TEAM.GOOD]>=3 || score[TEAM.BAD]>=3){
                transaction.update(roomRef, {...room, status: STATUS.FINISHED, score});
                return;
            }
            let members = room.members;
            if(lastMission.status !== OP_STATUS.REJECTED  && room.defectorTurn.includes(lastMission.num)){
                members = makeDefectorSwap(members);
            }
            const mission = createMission(lastMission, members);
            transaction.update(roomRef, {...room, score, members, missions: [...room.missions, mission]});
        }
    });
}

export const gameApi = {create, join, listenRoom, login, start, end, kick, setRoles, updateCurrentMission, nextMission, addBot, proposeTeam, voteTeam};