import React from "react";
import {OP_STATUS} from "../../../../api/enum";

export class MissionStatus extends React.Component{

    render() {
        const {room} = this.props;
        const missionNum = room.missions.length;
        const mission = room.missions[missionNum-1];

        return <React.Fragment>
            {mission.status === OP_STATUS.PREPARE && <div className="ui yellow message">
                <div className="header">Waiting for the Leader to propose a team</div>
            </div>}
            {mission.status === OP_STATUS.VOTE && <div className="ui blue message">
                <div className="header">Approve or reject this team</div>
            </div>}
            {mission.status === OP_STATUS.PROGRESS && <div className="ui blue message">
                <div className="header">Mission is in progress</div>
            </div>}
            {mission.status === OP_STATUS.REJECTED && <div className="ui message">
                <div className="header">The team was rejected by the majority</div>
            </div>}
            {mission.status === OP_STATUS.FAIL && <div className="ui red message">
                <div className="header">The team has failed your expectations</div>
            </div>}
            {mission.status === OP_STATUS.SUCCESS && <div className="ui green message">
                <div className="header">The team was successful</div>
            </div>}
        </React.Fragment>

    }


}