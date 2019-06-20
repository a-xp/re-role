import React from "react";
import {Header} from "semantic-ui-react";

import {gameApi} from "../../api/game";
import {STATUS} from "../../api/enum";
import {BottomMenu} from "./BottomMenu";
import {MembersList} from "./MembersList";
import './index.css';
import {Board} from "./Board";

export const TABS = {
    BOARD: 'BOARD',
    MEMBERS: 'MEMBERS',
    HISTORY: 'HISTORY'
};

export class Room extends React.Component {

    state = {
        room: null,
        errMsg: null,
        tab: TABS.BOARD
    };

    removeListener = null;

    render() {
        const {login, roomId} = this.props;
        const {room, errMsg, tab} = this.state;
        const user = room && room.members.find(u => u.login === login);
        return user && room ?
                <div className="room">
                    {errMsg && <div className="ui negative message room-msg">
                        <div className="header">Something went wrong</div>
                        <p>{errMsg}</p>
                    </div>}
                    <div className="room-content">
                        {tab === TABS.MEMBERS &&
                            <MembersList room={room} user={user} api={gameApi} roomId={roomId} onLeave={() => this.leave()}/>
                        }
                        {tab === TABS.BOARD && <Board room={room} user={user} roomId={roomId} api={gameApi}/>}
                    </div>
                    <BottomMenu onTabSet={(tab)=>this.setState({tab})} tab={tab}/>
                </div>
             : <Header centered="true" as='h5'>Searching for a room</Header>
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

    clearErr = () => {
        this.setState({
            errMsg: null
        })
    };

    leave(){
        const {onLeave} = this.props;
        console.log('leave');
        onLeave && onLeave();
    }

}


