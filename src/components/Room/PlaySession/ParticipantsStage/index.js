import React from "react";
import {getRoleVision, roleTraits} from "../../../../domain/roles";
import {OP_STATUS} from "../../../../api/enum";
import {MissionStatus} from "../MissionStatus";


export class ParticipantsStage extends React.Component {

    render() {
        const {user, room} = this.props;
        const missionNum = room.missions.length;
        const mission = room.missions[missionNum-1];
        const {members} = room;
        const leader = members[mission.leader];
        const leaderVision = leader.login === user.login ? user.role : getRoleVision(user.role, leader.role);
        return <React.Fragment>
            <MissionStatus room={room}/>
            <h3 className="ui header">
                <img className="ui avatar image" src={roleTraits[leaderVision].icon}/>
                <div className="content">
                    Leader {leader.login}
                    {roleTraits[leaderVision].title && <div className="sub header">{roleTraits[leaderVision].title}</div>}
                </div>
            </h3>
            <div className="content">Proposed operatives:</div>
            <div className="ui list">
                {mission.participants.map(mid => {
                    const participant = members[mid];
                    const vision = participant.login === user.login ? user.role : getRoleVision(user.role, participant.role);
                    return <div className="item" key={mid}>
                        <img className="ui avatar image" src={roleTraits[vision].icon}/>
                        <div className="content">
                            <div className="header">{participant.login}</div>
                            <div className="description">{roleTraits[vision].title}</div>
                        </div>
                    </div>})}
            </div>
        </React.Fragment>
    }

}