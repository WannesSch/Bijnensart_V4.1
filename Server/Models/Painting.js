class Painting {
    constructor(id, title, desc, type, paintingamount, price, buystate) {
        this.id = id;
        this.title = title;
        this.description = desc;
        this.type = type;
        this.paintingamount = paintingamount;
        this.price = price;
        this.buystate = buystate;
        this.views = 0;
        this.uploadDate = new Date();
        this.alt = this.type + " van BijnensArt"
    }
}

module.exports = { Painting }