import React from "react";
import {Button, Header, Message} from "semantic-ui-react";

import {gameApi} from "../../api/game";
import {STATUS} from "../../api/enum";
import {NewGameHeader} from "./NewGameHeader";
import {ActiveGameHeader} from "./ActiveGameHeader";
import {FinishedGameHeader} from "./FinishedGameHeader";
import {MembersList} from "./MembersList";

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
                {room.status === STATUS.NEW && <NewGameHeader roomId={roomId}/>}
                {room.status === STATUS.STARTED && <ActiveGameHeader role={user.role}/>}
                {room.status === STATUS.FINISHED && <FinishedGameHeader/>}
                <Header as='h3'>Players in this room</Header>
                <MembersList user={user} members={room.members} showKickBtn={room.status === STATUS.NEW && user.host}
                             onKick={this.kick} status={room.status} type={room.type}/>
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
        const {roomId} = this.props;
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


