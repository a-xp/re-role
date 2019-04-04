import db from '../firebase';
import {STATUS, TEAM} from "./enum";

async function create(type, login, prefSide) {
    const ref = await db.collection('rooms').add(
        {
            type,
            members: [
                {login, prefSide, host: true, team: TEAM.BAD}
            ],
            status: STATUS.NEW
        }
    );
    return ref.id;
}

async function join(id, login, prefSide) {
    const roomRef = db.collection('rooms').doc(id);
    const room = await roomRef.get();
    if(room.exists){
        return await roomRef.transaction(room => {
            if(room.members.some(m => m.login === login)) return room;
            return {...room, members: [...room.members, {login, prefSide}]}
        })
    }else{
        throw new Error('Room not found')
    }
}

function listenRoom(id, cb) {
    return db.collection('rooms').doc(id).onSnapshot(cb);
}

export const gameApi = {create, join, listenRoom};