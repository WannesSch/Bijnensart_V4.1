const ImageCrop = require("jimp");
const passwordHash = require("password-hash");
const path = require("path");
const { Visit } = require("./Visit");
const fs = require("fs");

const defaultPath = "./public";

class Controls {
  constructor(_accounts) {
    this.TempFiles = [];
    this.currentTempFileId = 0;
    this.maxWidth = 1200;
    this.maxHeight = 640;
    this.accounts = _accounts;
  }
  GeneratePrivateCode() {
    return (Math.random() + 1).toString(36).substring(2);
  }
  CheckLogin(username, password) {
    var account = null;
    for (let i = 0; i < this.accounts.accountList.length; i++) {
      if (this.accounts.accountList[i].userName == username) {
        if (
          passwordHash.verify(
            password,
            this.accounts.accountList[i].hashedPassword
          )
        )
          account = this.accounts.accountList[i];
        else return ["ERROR", "Ingegeven wachtwoord klopt niet."];
      }
    }

    if (account == null)
      return ["ERROR", "Er werd geen account met deze gegevens gevonden."];
    account.currentPrivateCode = this.GeneratePrivateCode();
    setTimeout(() => {
      account.currentPrivateCode = "";
    }, 2 * 60 * 60 * 1000);
    return ["SUCCESS", JSON.stringify(account)];
  }
  CheckIfVisitExists(dataArr) {
    var visit = null;
    for (let i = 0; i < this.visitArr.length; i++)
      if (this.visitArr[i].ip == dataArr[0]) visit = this.visitArr[i];

    if (visit == null) {
      var country;
      switch (dataArr[1]) {
        case "BE":
          country = "België";
          break;
        case "NL":
          country = "Nederland";
          break;
        case "FR":
          country = "Frankrijk";
          break;
        case "DE":
          country = "Duitsland";
          break;
        case "SE":
          country = "Zweden";
          break;
        case "UK":
          country = "Engeland";
          break;
        default:
          "";
          break;
      }

      visit = new Visit(
        dataArr[0],
        1,
        country,
        dataArr[2],
        dataArr[3],
        currTime.split("|")[0].replace(" ", "")
      );
      this.visitArr.push(visit);
      this.UpdateVisitJSON();
      return;
    }
    visit.visits++;
    visit.lastvisit = currTime.split("|")[0].replace(" ", "");
    this.UpdateVisitJSON();
  }
  GetID() {
    return (Math.random() + 1).toString(36).substring(7);
  }
  FindTempFileById(id) {
    var file = null;

    for (let i = 0; i < this.TempFiles.length; i++)
      if (this.TempFiles[i].id == id) file = this.TempFiles[i];

    return file;
  }
  HandleImage(filename) {
    ImageCrop.read(
      path.join(defaultPath, "/Images/TempFiles/" + filename),
      (err, file) => {
        if (err) throw err;

        file
          .scaleToFit(this.maxWidth, this.maxHeight)
          .write(path.join(defaultPath, "/Images/TempFiles/" + filename));
      }
    );
  }
  EmptyTempFilesDir() {
    fs.readdir(path.join(defaultPath, "/Images/TempFiles/"), (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(defaultPath, "/Images/TempFiles/", file), (err) => {
          if (err) throw err;
        });
      }
    });
  }
  HandleVisit(data) {
    let visits = JSON.parse(
      fs.readFileSync(path.join(defaultPath, "/Data/Visitors.json"))
    );
    let valid = true;

    for (let visit of visits) if (visit.ip == data.ip) valid = false;

    if (!valid) return;
    let cities = JSON.parse(
      fs.readFileSync(path.join(defaultPath, "/Data/BelgianCities.json"))
    );

    let foundlocation;

    for (let location of cities)
      if (location.zip == data.postal) foundlocation = location;

    let date = new Date().getMonth() + 1 + "-" + new Date().getFullYear();
    visits.push(
      new Visit(
        data.ip,
        data.country_name,
        foundlocation.state,
        foundlocation.city,
        date
      )
    );

    fs.writeFileSync(
      path.join(defaultPath, "/Data/Visitors.json"),
      JSON.stringify(visits)
    );
  }
  GetVisits() {
    return JSON.parse(
      fs.readFileSync(path.join(defaultPath, "/Data/Visitors.json"))
    );
  }
  CheckVisit(ip) {
    let visits = JSON.parse(
      fs.readFileSync(path.join(defaultPath, "/Data/Visitors.json"))
    );
    let exists = false;
    for (let visit of visits) {
      if (visit.ip == ip) exists = true;
    }

    return exists;
  }
}

module.exports = { Controls };
