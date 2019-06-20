import db from '../firebase';
import {OP_STATUS, STATUS, TEAM} from "./enum";
import {assignRoles, getDefectorTurns, ROLES, roleTraits} from "../domain/roles";
import {getNextLeader, getScore} from "../domain/missions";

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

async function login(cred) {
    const {roomId, login, secret} = cred;
    const roomRef = db.collection('rooms').doc(roomId);
    const room = await roomRef.get();
    if(room.exists){
        const user = room.get('members').find(m => m.login === login && m.secret === secret);
        if(user){
            return true;
        }else{
            return Promise.reject('Invalid credentials')
        }
    }else{
        return Promise.reject('Room not found')
    }
}

async function start(roomId) {
    const roomRef = db.collection('rooms').doc(roomId);
    await db.runTransaction( async transaction => {
        const roomDoc = await roomRef.get();
        const room = roomDoc.data();
        const numPlayers = room.members.length;
        if(numPlayers < 5 || numPlayers > 10){
            throw new Error("Number of players should be between 5 and 10");
        }
        if(room.status === STATUS.NEW){
            const roles = assignRoles(room.members.map(m => m.prefSide), room.roles);
            console.log(roles);
            const defectorTurn = getDefectorTurns(roles);
            const newMembers = room.members.map( (m,i) => ({...m, team: roleTraits[roles[i]].side, role: roles[i], originalRole: roles[i]}));
            transaction.update(roomRef, {...room, members: newMembers, status: STATUS.STARTED, missions:[
                    {num: 0, status: OP_STATUS.PREPARE, leader: Math.ceil(Math.random() * newMembers.length), participants: []}
                ], defectorTurn, score:{[TEAM.BAD]:0, [TEAM.GOOD]:0}});
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
            const mission = mutator(room.missions[room.missions.length-1]);
            transaction.update(roomRef, {...room, missions: [...room.missions.slice(0, room.missions.length-1),
                    mission]});
        }
    });
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
            console.log(room, score);
            if(score[TEAM.GOOD]>=3 || score[TEAM.BAD]>=3){
                transaction.update(roomRef, {...room, status: STATUS.FINISHED, score});
                return;
            }
            let members = room.members;
            if(room.defectorTurn.includes(room.num)){
                members = members.map(m => {
                    if(m.role === ROLES.DEFECTOR) return ROLES.SPY_DEFECTOR;
                    if(m.role === ROLES.SPY_DEFECTOR) return ROLES.DEFECTOR;
                    return m;
                })
            }
            transaction.update(roomRef, {
                ...room, score, members, missions: [...room.missions,
                    {
                        status: OP_STATUS.PREPARE,
                        leader: getNextLeader(lastMission.leader, room.members.length),
                        participants: [],
                        num: lastMission.status === OP_STATUS.REJECTED ? lastMission.num : lastMission.num + 1
                    }
                ]});
        }
    });
}

export const gameApi = {create, join, listenRoom, login, start, end, kick, setRoles, updateCurrentMission, nextMission};