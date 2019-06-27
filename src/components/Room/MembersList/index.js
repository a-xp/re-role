import React from "react";
import {STATUS} from "../../../api/enum";
import {Button, Icon, Image, List} from "semantic-ui-react";
import {getRoleVision, ROLES, roleTraits, teamTraits} from "../../../domain/roles";

export class MembersList extends React.Component {

    render() {
        const {user, room, onLeave} = this.props;
        const {members, status} = room;
        const userRole = user.role && roleTraits[user.role];
        const userTeam = userRole && teamTraits[userRole.side];
        return <React.Fragment>
            {userRole && <div className="ui fluid card">
                <div className="content">
                    <img className="right floated tiny ui image" src={userRole.icon} alt={userRole.title}/>
                    <div className={`header ${userTeam.color}`} >
                        {userRole.title}
                    </div>
                    <div className="meta">
                        Allegiance: {userTeam.title}
                    </div>
                    <p/>
                    {userRole.info && <p>{userRole.info}</p>}
                    <div>
                        Win conditions:
                        <ul>
                            {userTeam.success && userTeam.success.map(t => <li className="text success" key={t}>{t}</li>)}
                            {userRole.fail && userRole.fail.map(t => <li className="text danger" key={t}>{t}</li>)}
                        </ul>
                    </div>
                </div>
            </div>}
            <List verticalAlign='middle' size='large' celled>
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
                    {user.host && status === STATUS.NEW && <List.Content floated='right'>
                        <Button icon onClick={() => this.kick(m.login)} color='red'>
                            <Icon name='thumbs down'/>
                        </Button>
                    </List.Content>}
                    {user.host && status !== STATUS.NEW && m.bot && <List.Content floated='right'>
                        <Button icon onClick={() => this.setVision(m.login)} color='blue'>
                            <Icon name='eye'/>
                        </Button>
                    </List.Content>}
                </List.Item>})}
            </List>
            <div className="ui fluid buttons">
                {user.host && status === STATUS.NEW && <button className="ui primary button" onClick={() => this.addBot()}>Add bot</button>}
                {user.bot && <button className="ui positive button" onClick={()=>this.setVision(members.find(m=>m.host).login)}>Return to host</button>}
                <button className="ui negative button" onClick={onLeave}>Leave</button>
            </div>
        </React.Fragment>
    }


    kick(login){
        const {roomId, api} = this.props;
        api.kick(login, roomId);
    }

    addBot(){
        const {roomId, api} = this.props;
        api.addBot(roomId);
    }

    setVision(login){
        this.props.setVision && this.props.setVision(login);
    }

}

function getVision(status, user, member) {
    switch (status) {
        case STATUS.FINISHED: return member.role;
        case STATUS.STARTED: return user.login === member.login ? member.role : getRoleVision(user.role, member.originalRole);
        default: return ROLES.UNKNOWN;
    }
}