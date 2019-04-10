import React from "react";
import {STATUS} from "../../../api/enum";
import {Button, Icon, Image, List} from "semantic-ui-react";
import {getRoleVision, ROLES, roleTraits} from "../../../domain/roles";

export class MembersList extends React.Component {

    render() {
        const {members, user, showKickBtn, onKick, status, type} = this.props;
        return <List verticalAlign='middle' size='huge' celled>
            {members.map(m => {
                const role = getVision(status, user, m, type);
                return <List.Item key={m.login}>
                <Image avatar src={roleTraits[role].icon}/>
                <List.Content>
                    <List.Header>{m.login}</List.Header>
                    {status !== STATUS.NEW && <List.Description>
                        {roleTraits[role].title}
                    </List.Description>}
                </List.Content>
                {showKickBtn && <List.Content floated='right'>
                    <Button icon onClick={() => onKick(m.login)} color='red'>
                        <Icon name='thumbs down'/>
                    </Button>
                </List.Content>}
            </List.Item>})}
        </List>
    }

}

function getVision(status, user, member, type) {
    switch (status) {
        case STATUS.FINISHED: return member.role;
        case STATUS.STARTED: return user.login === member.login ? member.role : getRoleVision[type](user.role, member.role);
        default: return ROLES.UNKNOWN;
    }
}