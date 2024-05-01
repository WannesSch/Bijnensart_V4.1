class Visit {
    constructor(_ip, _country, _state, _city, _visitDate) {
        this.ip = _ip;
        this.country = _country;
        this.state = _state;
        this.city = _city;
        this.visitDate = _visitDate;
    }
}

module.exports = { Visit }