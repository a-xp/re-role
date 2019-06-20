import React from "react";
import {ROLES, roleTraits, teamTraits} from "../../../../domain/roles";

export class DefectorMessage extends React.Component {

    render() {
        const {user, room, mission} = this.props;

        if((user.role === ROLES.DEFECTOR || user.role === ROLES.SPY_DEFECTOR) && room.defectorTurn.includes(mission.num)){
            const role = user.role === ROLES.DEFECTOR ? roleTraits[ROLES.SPY_DEFECTOR] : roleTraits[ROLES.DEFECTOR];
            return <div className="ui fluid card">
                <div className="content">
                        <img className="right floated small ui image" src={role.icon}/>
                        <div className="header">
                            Your allegiance has changed
                        </div>
                        <div className="meta">
                            Defector action
                        </div>
                        <div className="description">
                            From the next turn you are sided with <b className={teamTraits[role.side].color}>{teamTraits[role.side].title}</b>
                        </div>
                </div>
            </div>
        }

        return null;
    }

}