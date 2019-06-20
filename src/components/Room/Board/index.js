import React from "react";
import {STATUS} from "../../../api/enum";
import {RoleCustomizeForm} from "../RoleCustomizeForm";
import {PlaySession} from "../PlaySession";
import {ScoreBoard} from "../ScoreBoard";

export class Board  extends React.Component{

    render(){
        const {room, api, roomId, user} = this.props;
        const {status} = room;

        return <React.Fragment>
            {status === STATUS.NEW && <RoleCustomizeForm room={room} api={api} roomId={roomId} user={user}/>}
            {status === STATUS.STARTED && <PlaySession room={room} api={api} roomId={roomId} user={user}/>}
            {status === STATUS.FINISHED && <ScoreBoard room={room}/>}
        </React.Fragment>
    }

}