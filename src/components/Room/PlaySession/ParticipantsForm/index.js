import React from "react";
import {OP_STATUS} from "../../../../api/enum";
import {participantsCount} from "../../../../domain/missions";

export class ParticipantsForm extends React.Component{

    render() {
        const {room} = this.props;
        const missionNum = room.missions.length;
        const mission = room.missions[missionNum-1];
        const {members} = room;
        console.log(mission);
        const numParticipants = participantsCount[room.members.length][mission.num];

        return <div className="ui form">
            <h4 className="ui dividing header">You are the Leader. Choose {numParticipants} operatives for this mission</h4>
            {   members.map((m,mid) =>
                <div className="field" key={m.login}>
                    <div className="ui checkbox" onClick={()=>{this.toggleParticipant(mid)}}>
                        <input type="checkbox" className="hidden" checked={mission.participants.includes(mid)} value={mid} onChange={()=>{}}/>
                        <label>{m.login}</label>
                    </div>
                </div>)
            }
            {mission.participants.length === numParticipants && <button className="ui positive fluid button" onClick={() => this.propose()}>Propose team</button>}
        </div>
    }

    toggleParticipant(mid) {
        const {roomId, api, room} = this.props;
        api.updateCurrentMission(roomId, mission => {
            const participants = mission.participants;
            const numParticipants = participantsCount[room.members.length][mission.num];
            if(participants.includes(mid)){
                return {...mission, participants: participants.filter(id => id!==mid)};
            }else if(participants.length<numParticipants){
                return {...mission, participants: [...participants, mid]};
            }else{
                return mission;
            }
        });
    }

    propose(){
        const {api, roomId} = this.props;
        api.proposeTeam(roomId);
    }

}