import React from "react";
import {Button, Header, Icon, Image, List, Message} from "semantic-ui-react";
import resistanceIcon from './soldier.svg';
import spyIcon from './secret-agent.svg';
import anonymousIcon from './anonymous.svg';
import {gameApi} from "../../api/game";
import {STATUS, TEAM} from "../../api/enum";

export class Room extends React.Component {

    state = {
        room: null,
        errMsg: null
    };

    removeListener = null;

    render() {
        const {login, roomId} = this.props;
        const {room, errMsg} = this.state;
        const user = room && room.members.find(u => u.login === login);
        return user && room ? <React.Fragment>
                    <Message size='large' icon={room.status === STATUS.STARTED}>
                        { room.status === STATUS.STARTED && <Image circular size='small' src={teamIcons[user.team]}/>}
                        <Message.Content>
                        {room.status === STATUS.NEW && <React.Fragment>
                            <p>Waiting for other players to join</p>
                            <p><a className="roomLink" href={`/${roomId}`}>ROOM LINK</a></p>
                        </React.Fragment>}
                        {room.status === STATUS.STARTED && <React.Fragment>
                            <Message.Header>Game is in progress</Message.Header>
                            <p>You are a {teamText[user.team][0]}</p>
                            <p>{teamText[user.team][1]}</p>
                        </React.Fragment>}
                        {room.status === STATUS.FINISHED && <React.Fragment>
                            <Message.Header>Game has ended</Message.Header>
                        </React.Fragment>}
                        </Message.Content>
                    </Message>
                <Header as='h3'>Players in this room</Header>
                <List verticalAlign='middle' size='huge' celled>
                    {room.members.map(m => <List.Item key={m.login}>
                        <Image avatar src={this.memberIcon(m, user, room.status)}/>
                        <List.Content>
                            <List.Header>{m.login}</List.Header>
                        </List.Content>
                        {room.status === STATUS.NEW && user.host && <List.Content floated='right'>
                            <Button icon onClick={() => this.kick(m.login)} color='red'><Icon name='thumbs down'/></Button>
                        </List.Content>}
                    </List.Item>)}
                </List>
                 { errMsg && <Message negative>
                    <Message.Header>Something went wrong!</Message.Header>
                        {errMsg}
                    </Message>}
                 <div>
                    {user.host && room.status === STATUS.NEW && <Button color='green' size='large' onClick={this.start}>Start the game</Button>}
                    {user.host && room.status === STATUS.STARTED && <Button color='green' size='large' onClick={this.end}>End the game</Button>}
                    <Button size='large' color='red' onClick={this.leave}>Leave the room</Button>
                </div>
            </React.Fragment> : <Header centered="true" as='h5'>Searching for a room</Header>
    }

    componentDidMount() {
        const {roomId, login} = this.props;
        this.removeListener = gameApi.listenRoom(roomId, (room) => {
            this.setState({
                room: room.data()
            })
        })
    }

    componentWillUnmount(){
        if(this.removeListener){
            this.removeListener();
            this.removeListener = null;
        }
    }

    memberIcon = (member, user, status) => {
        switch (status) {
            case STATUS.STARTED: return user.login === member.login || user.team === TEAM.BAD ?
                teamIcons[member.team] : anonymousIcon;
            case STATUS.FINISHED: return teamIcons[member.team];
            default: return anonymousIcon;
        }
    };

    start = () => {
        this.clearErr();
        const {room} = this.state;
        const {roomId} = this.props;
        if(room.status === STATUS.NEW && room.members.length >= 1 && room.members.length < 10){
            gameApi.start(roomId).catch(err => {
                this.setState({
                    errMsg: err.message || 'Unknown error'
                })
            });
        }
    };

    end = () => {
        this.clearErr();
        const {roomId} = this.props;
        gameApi.end(roomId).catch(err => {
            this.setState({
                errMsg: err.message || 'Unknown error'
            })
        });
    };

    leave = () => {
        const {onLeave} = this.props;
        onLeave && onLeave();
    };

    kick = (login) => {
        this.clearErr();
        const {roomId} = this.props;
        gameApi.kick(login, roomId).catch(err => {
            this.setState({
                errMsg: err.message || 'Unknown error'
            })
        });
    };

    clearErr = () => {
        this.setState({
            errMsg: null
        })
    }

}

const teamIcons = {
    [TEAM.GOOD]: resistanceIcon,
    [TEAM.BAD]: spyIcon
};

const teamText = {
    [TEAM.BAD]: [
        "government spy",
        "Infiltrate the Resistance and thwart their missions!"
    ],
    [TEAM.GOOD]: [
        "member of the Resistance",
        "Overthrow these powerful unjust rulers!"
    ]
};