import React from "react";
import {STATUS} from "../../../api/enum";
import {Button, Icon, Image, List} from "semantic-ui-react";
import {getRoleVision, ROLES, roleTraits, teamTraits} from "../../../domain/roles";

export class MembersList extends React.Component {

    render() {
        const {user, room, onLeave} = this.props;
        const {members, status, type} = room;
        const userRole = user.role && roleTraits[user.role];
        const userTeam = userRole && teamTraits[userRole.side];
        return <div>
            <h2 className="ui center aligned header">Roles</h2>
            {userRole && <div className="ui fluid card">
                <div className="content">
                    <img className="right floated tiny ui image" src={userRole.icon} alt={userRole.title}/>
                    <div className={`header ${userTeam.color}`} >
                        {userRole.title}
                    </div>
                    <div className="meta">
                        {userTeam.title}
                    </div>
                    <p/>
                    {userRole.info && <p>{userRole.info}</p>}
                    <p>
                        Win conditions:
                        <ul>
                            {userTeam.success && userTeam.success.map(t => <li className="text success" key={t}>{t}</li>)}
                            {userRole.fail && userRole.fail.map(t => <li className="text danger" key={t}>{t}</li>)}
                        </ul>
                    </p>
                </div>
            </div>}
            <List verticalAlign='middle' size='huge' celled>
                {members.map(m => {
                    const role = getVision(status, user, m);
                    return <List.Item key={m.login}>
                    <Image avatar src={roleTraits[role].icon}/>
                    <List.Content>
                        <List.Header>{m.login}</List.Header>
                        {status !== STATUS.NEW && <List.Description>
                            {roleTraits[role].title}
                        </List.Description>}
                    </List.Content>
                    {user.host && <List.Content floated='right'>
                        <Button icon onClick={() => this.kick(m.login)} color='red'>
                            <Icon name='thumbs down'/>
                        </Button>
                    </List.Content>}
                </List.Item>})}
            </List>
            <button className="ui fluid negative button" onClick={onLeave}>Leave</button>
        </div>
    }


    kick(login){
        const {roomId, api} = this.props;
        api.kick(login, roomId);
    }

}

function getVision(status, user, member) {
    switch (status) {
        case STATUS.FINISHED: return member.role;
        case STATUS.STARTED: return user.login === member.login ? member.role : getRoleVision(user.role, member.originalRole);
        default: return ROLES.UNKNOWN;
    }
}