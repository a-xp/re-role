import React from "react";
import {ROLES, roleTraits, teamTraits} from "../../../domain/roles";

const options = Object.values(roleTraits).filter(r => !r.base && r.side);

export class RoleCustomizeForm extends React.Component{

    render() {
        const {room, api, roomId, user} = this.props;
        const {members, roles = []} = room;


        return <React.Fragment>
                <div className="ui large message">
                    <div className="content">
                        <p>Waiting for other players to join</p>
                        <p><a className="roomLink" href={`#${roomId}`}>ROOM LINK</a></p>
                    </div>
                </div>
                <p><b>People in this room ({members.length}):</b> {members.map(m=>m.login).join(", ")}</p>
            <p><b>Possible roles:</b> {[ROLES.RESISTANCE, ROLES.SPY, ...roles]
                .map((r,i) => [
                    i>0 &&", ",
                    <span key={i} className={teamTraits[roleTraits[r].side].color}>{roleTraits[r].title}</span>])}
                </p>
            {user.host && <div className="ui form">
                    {   options.map(r =>
                            <div className="field" key={r.id}>
                                <div className="ui checkbox" onClick={()=>{this.toggleRole(r.id)}}>
                                    <input type="checkbox" className="hidden" checked={roles.includes(r.id)} value={r.id} onChange={()=>{}}/>
                                    <label>{r.title}</label>
                                </div>
                            </div>)
                    }
                    <button className="ui fluid positive button" onClick={()=>{this.start()}}>Start</button>
                </div>}

        </React.Fragment>
    }

    toggleRole(role) {
        const {room:{roles = []}, api, roomId} = this.props;
        if(roles.includes(role)){
            api.setRoles(roomId, roles.filter(r => r!==role));
        }else{
            api.setRoles(roomId, [...roles, role]);
        }
    }

    start(){
        const {room:{members}, api, roomId} = this.props;
        if(members.length>=5){
            api.start(roomId);
        }
    }

}