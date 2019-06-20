import React from "react";
import {TEAM} from "../../../api/enum";
import {ROLES, roleTraits, teamTraits} from "../../../domain/roles";

export class ScoreBoard extends React.Component{

    render() {
        const {room:{score}} = this.props;

        if(score[TEAM.BAD] > score[TEAM.GOOD]) {
            return <React.Fragment>
                    <img className="ui medium circular image centered" src={roleTraits[ROLES.SPY].icon}/>
                    <h2 className={`ui center aligned header ${teamTraits[TEAM.BAD].color}`}>The Spies Won</h2>
            </React.Fragment>
        }else{
            return <React.Fragment>
                <img className="ui medium circular image centered" src={roleTraits[ROLES.RESISTANCE].icon}/>
                <h2 className={`ui center aligned header ${teamTraits[TEAM.GOOD].color}`}>The Resistance Won</h2>
            </React.Fragment>
        }

    }

}