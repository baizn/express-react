import alt from '../alt';
import {GET_STATS_SUCCESS, GET_STATS_FAIL} from '../constants/Constants';

class StatsActions {
    constructor() {
        this.generateActions(
            GET_STATS_SUCCESS,
            GET_STATS_FAIL
        );
    }

    getStats() {
        $.ajax({
            url: '/api/stats'
        }).done((data) => {
            this.actions.getStatsSuccess(data);
        }).fail((err) => {
            this.actions.getStatsFail(err);
        });
    }
}

export default alt.createActions(StatsActions);
