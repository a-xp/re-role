import React from "react";
import {VOTE} from "../../../../api/enum";

export class VotesList extends React.Component {

    render() {
        const {room, mission} = this.props;

        return <div className="ui  divided list">
            {room.members.map((m,id) => <div className="item" key={m.login}>
                <div className="right floated content">
                    {mission.vote[id] === VOTE.YES ? <i className="thumbs up icon success text"/> :
                        <i className="thumbs down icon danger text"/>}
                </div>
                <div className="content">
                    {m.login}
                </div>
            </div>)}
        </div>

    }

}