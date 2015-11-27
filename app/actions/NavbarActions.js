import alt from '../alt';

import {UPDATE_ONLINE_USERS, UPDATE_AJAX_ANIMATION, UPDATE_SEARCH_QUERY
    , GET_CHARACTER_COUNT_SUCCESS, GET_CHARACTER_COUNT_FAIL, FIND_CHARACTER_SUCCESS, FIND_CHARACTER_FAIL} from '../constants/Constants';

class NavbarActions {
    constructor() {
        this.generateActions(
            UPDATE_ONLINE_USERS,
            UPDATE_AJAX_ANIMATION,
            UPDATE_SEARCH_QUERY,
            GET_CHARACTER_COUNT_SUCCESS,
            GET_CHARACTER_COUNT_FAIL,
            FIND_CHARACTER_SUCCESS,
            FIND_CHARACTER_FAIL
        );
    }

    findCharacter(payload) {
        $.ajax({
            url: '/api/characters/search',
            data: {
                name: payload.searchQuery
            }
        }).done((data) => {
            Object.assign(payload, data);
            this.actions.findCharacterSuccess(payload);
        }).fail(() => {
            this.actions.findCharacterFail(payload);
        });
    }

    getCharacterCount() {
        $.ajax({
            url: '/api/characters/count'
        }).done((data) => {
            this.actions.getCharacterCountSuccess(data);
        }).fail((err) => {
            this.actions.getCharacterCountFail(err);
        })
    }
}

export default alt.createActions(NavbarActions);
