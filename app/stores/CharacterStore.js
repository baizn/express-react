import {assign, contains} from 'underscore';
import alt from '../alt';
import CharacterActions from '../actions/CharacterActions';

class CharacterStore {
    constructor() {
        this.bindActions(CharacterActions);
        this.characterId = 0;
        this.name = 'NEF';
        this.race = 'NEF';
        this.bloodline = 'NEF';
        this.gender = 'NEF';
        this.wins = 0;
        this.losser = 0;
        this.winLossRatio = 0;
        this.isReported = false;
    }

    onGetCharacterSuccess(data) {
        assign(this, data);
        debugger;
        $(document.body).attr('class', 'profile ' + this.race.toLowerCase());
        let localData = localStorage.getItem('NEF') ? JSON.parse(localStorage.getItem('NEF')) : {};
        let reports = localData.reports || [];
        this.isReported = contains(reports, this.characterId);

        this.winLossRatio = ((this.wins / (this.wins + this.losser) * 100)  || 0).toFixed(1);
    }

    onGetCharacterFail(err) {
        toastr.error(err.responseJSON.message);
    }

    onReportSuccess() {
        this.isReported = true;
        let localData = localStorage.getItem('NEF') ? JSON.parse(localStorage.getItem('NEF')) : {};
        localData.reports = localData.reports || [];
        localData.reports.push(this.characterId);
        localStorage.setItem('NEF', JSON.stringify(localData));
        toastr.warning('Character has been reported.');
    }

    onReportFail(err) {
        toastr.error(err.responseJSON.message);
    }
}

export default alt.createStore(CharacterStore);
