import db from '../firebase';
import {STATUS, TEAM} from "./enum";

async function create(type, login, prefSide) {
    const secret = makeSecret();
    const ref = await db.collection('rooms').add(
        {
            type,
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
            const teams = room.members.reduce( (r, m) => ({...r, [m.prefSide]: [...r[m.prefSide], m.login]}), {
                [TEAM.BAD]: [],
                [TEAM.GOOD]: [],
                [TEAM.RANDOM]: []
            });
            const players = [...shuffle(teams[TEAM.GOOD]), ...shuffle(teams[TEAM.RANDOM]), ...shuffle(teams[TEAM.BAD])];
            const newMembers = room.members.map( m => ({...m, team: players.indexOf(m.login) < teamSize[players.length] ? TEAM.GOOD : TEAM.BAD}));
            transaction.update(roomRef, {...room, members: newMembers, status: STATUS.STARTED});
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

function makeSecret(){
    return Math.random().toString(36).replace(/[^a-z]+/g, '');
}

function listenRoom(id, cb) {
    return db.collection('rooms').doc(id).onSnapshot(cb);
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

const teamSize = {
    5: 3, 6:4, 7:4,8:5,9:6,10:6
};



export const gameApi = {create, join, listenRoom, login, start, end, kick};