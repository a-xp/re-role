import React from "react";
import {OP_STATUS, VOTE} from "../../../../api/enum";

export class VoteForm extends React.Component{

    render() {
        const {user, room, api, roomId, mission} = this.props;
        const {vote = {}} = mission;
        const curVote = vote[room.members.findIndex(m => m.login === user.login)];

        return curVote ?
            (curVote === VOTE.YES ?
                <div className="ui green message"><div className="header">You approved the mission. Waiting for other player to vote</div></div> :
                <div className="ui red message"><div className="header">You rejected the mission. Waiting for other player to vote</div></div>) :
            <div className="ui fluid buttons">
                <button className="ui red button" onClick={()=>this.vote(VOTE.NO)}>
                    <i className="thumbs down icon"/>
                    Reject
                </button>
                <button className="ui green button" onClick={()=>this.vote(VOTE.YES)}>
                    <i className="thumbs up icon"/>
                    Approve
                </button>
            </div>
    }


    vote(resolution){
        const {roomId, api, room, user} = this.props;
        const userNum = room.members.findIndex(m => m.login === user.login);
        api.voteTeam(roomId, userNum, resolution);
    }
}