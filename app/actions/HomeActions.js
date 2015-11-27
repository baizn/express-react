import alt from '../alt';
import {GET_TWO_CHARACTERS_SUCCESS, GET_TWO_CHARACTERS_FAIL, VOTE_FAIL} from '../constants/Constants';

class HomeActions {
    constructor() {
        this.generateActions(
            GET_TWO_CHARACTERS_SUCCESS,
            GET_TWO_CHARACTERS_FAIL,
            VOTE_FAIL
        );
    };

    getTwoCharacters() {
        $.ajax({
            url: '/api/characters'
        }).done((data) => {
            this.actions.getTwoCharactersSuccess(data);
        }).fail((err) => {
            this.actions.getTwoCharactersFail(err.responseJSON.message);
        });
    }

    vote(winner, loser) {
        $.ajax({
            type: 'put',
            url: '/api/characters',
            data: {
                winner: winner,
                loser: loser
            }
        }).done(() => {
            this.actions.getTwoCharacters();
        }).fail((err) => {
            this.actions.voteFail(err.responseText);
        });
    }
}

export default alt.createActions(HomeActions);
