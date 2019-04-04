import React from "react";
import {Button, Header, Image, List, Message} from "semantic-ui-react";
import resistanceIcon from './soldier.svg';
import spyIcon from './secret-agent.svg';
import anonymousIcon from './anonymous.svg';
import {gameApi} from "../../api/game";
import {STATUS, TEAM} from "../../api/enum";

export class Room extends React.Component {

    state = {
        room: null
    };

    render() {
        const {login} = this.props;
        const {room} = this.state;
        const user = room && room.members.find(u => u.login === login);
        return room ? <React.Fragment>
                <Message size='large'>{statusText[room.status]}</Message>
                <Header as='h3'>Players in this room</Header>
                <List verticalAlign='middle' size='huge'>
                    {room.members.map(m => <List.Item>
                        <Image avatar src={this.memberIcon(m, user, room.status)}/>
                        <List.Content>
                            <List.Header>{m.login}</List.Header>
                        </List.Content>
                    </List.Item>)}
                </List>
            {user.host && <div>
                <Button primary size='large'>Start</Button>
                <Button secondary size='large'>End</Button>
            </div>}
            </React.Fragment> : <Header centered as='h5'>Searching for a room</Header>
    }

    componentDidMount() {
        const {roomId, login} = this.props;
        gameApi.listenRoom(roomId, (room) => {
            this.setState({
                room: room.data()
            })
        })
    }

    memberIcon = (member, user, status) => {
        switch (status) {
            case STATUS.STARTED: return user.login === member.login || user.team === TEAM.BAD ?
                teamIcons[member.team] : anonymousIcon;
            case STATUS.FINISHED: return teamIcons[member.team];
            default: return anonymousIcon;
        }
    }

}

const teamIcons = {
    [TEAM.GOOD]: resistanceIcon,
    [TEAM.BAD]: spyIcon
};

const statusText = {
    [STATUS.NEW]: 'Waiting for the host to start the game',
    [STATUS.STARTED]: 'The game was started',
    [STATUS.FINISHED]: 'The game has been completed'
};