import alt from '../alt';
import {GET_TOP_CHARACTERS_SUCCESS, GET_TOP_CHARACTERS_FAIL} from '../constants/Constants';
class FooterActions {
    constructor() {
        this.generateActions(
            GET_TOP_CHARACTERS_SUCCESS,
            GET_TOP_CHARACTERS_FAIL
        );
    }

    getTopCharacters() {
        $.ajax({
            url: '/api/characters/top'
        }).done((data) => {
            debugger
            this.actions.getTopCharactersSuccess(data);
        }).fail((err) => {
            debugger
            this.actions.getTopCharactersFail(err);
        });
    }
}

export default alt.createActions(FooterActions);
