import React from "react";
import {OP_STATUS} from "../../../api/enum";
import {ParticipantsForm} from "./ParticipantsForm";
import {ParticipantsStage} from "./ParticipantsStage";
import {VoteForm} from "./VoteForm";
import {DefectorMessage} from "./DefectorMessage";
import {VotesList} from "../VotesList";

export class PlaySession extends React.Component {

    render() {
        const {user, room, api, roomId} = this.props;
        console.log(room);
        const missionNum = room.missions.length;
        const mission = room.missions[missionNum-1];
        const {members} = room;
        const leader = members[mission.leader];
        const showParticipantsForm = mission.status === OP_STATUS.PREPARE && leader.login === user.login;

        return <React.Fragment>
            <h3 className="ui center aligned header">Mission {mission.num+1}</h3>
            {showParticipantsForm && <ParticipantsForm room={room} api={api} roomId={roomId}/>}
            {!showParticipantsForm && <ParticipantsStage room={room} api={api} roomId={roomId} user={user}/>}
            {mission.status === OP_STATUS.VOTE && <VoteForm room={room} user={user} api={api} mission={mission} roomId={roomId}/>}
            {mission.status === OP_STATUS.PROGRESS && user.host && <div className="ui fluid buttons">
                <button className="ui red button" onClick={()=>this.setMissionResult(OP_STATUS.FAIL)}>Mission fail</button>
                <button className="ui green button" onClick={()=>this.setMissionResult(OP_STATUS.SUCCESS)}>Mission success</button>
            </div>}
            { (mission.status === OP_STATUS.PROGRESS || OP_STATUS.isTerminal(mission.status)) && <VotesList room={room} mission={mission}/> }
            <DefectorMessage user={user} room={room} mission={mission}/>
            {OP_STATUS.isTerminal(mission.status) && user.host &&
            <button className="ui fluid primary button" onClick={()=>this.nextMission()}>Next mission</button>}
        </React.Fragment>
    }

    setMissionResult(result) {
        const {roomId, api} = this.props;
        api.updateCurrentMission(roomId, mission => {
            if(mission.status === OP_STATUS.PROGRESS){
                return {...mission, status: result};
            }else{
                return mission;
            }
        });
    }

    nextMission() {
        const {roomId, api} = this.props;
        api.nextMission(roomId);
    }

}