import React from "react";
import {TABS} from "../index";

export class BottomMenu extends React.Component {

    render() {
        const {onTabSet, onLeave} = this.props;
        return <div className="ui three buttons room-menu">
            <button className={`ui button ${this.btnClass(TABS.MEMBERS)}`} onClick={()=>onTabSet(TABS.MEMBERS)}><i className="eye slash icon"/></button>
            <button className={`ui button ${this.btnClass(TABS.BOARD)}`} onClick={()=>onTabSet(TABS.BOARD)}><i className="icon users"/> </button>
            <button className={`ui button ${this.btnClass(TABS.HISTORY)}`} onClick={()=>onTabSet(TABS.HISTORY)}><i className="stack exchange icon"/></button>
        </div>
    }

    btnClass(menuTab) {
        const tab = this.props.tab;
        return tab === menuTab ? 'secondary': ''
    }

}