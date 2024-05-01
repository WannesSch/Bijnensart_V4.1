const { Account } = require("./Account");
const fs = require("fs");

const defaultPath = "../public/";

class AccountRepository {
  constructor() {
    this.accountList = [];
  }
  ReadJSON() {
    var _JSON = fs.readFileSync(defaultPath + "/Data/Accounts.json");

    var seenNames = {};
    var accountArr = JSON.parse(_JSON);
    accountArr = accountArr.filter(function (currentObject) {
      if (currentObject.userName in seenNames) {
        return false;
      } else {
        seenNames[currentObject.userName] = true;
        return true;
      }
    });
    accountArr.forEach((account) => {
      var _account = new Account(
        account.firstName,
        account.lastName,
        account.userName,
        account.email,
        account.hashedPassword,
        account.isAdmin
      );
      this.accountList.push(_account);
    });
  }
  UpdateJSON() {
    var data = JSON.stringify(this.accountList);
    fs.writeFileSync(defaultPath + "/Data/Accounts.json", data);
  }
  AddAccount(account) {
    this.accountList.push(account);
    this.UpdateJSON();
    console.log(this.accountList);
  }
  FindAccountByUsername(username) {
    var account = null;
    for (let i = 0; i < this.accountList.length; i++)
      if (this.accountList[i].userName == username)
        account = this.accountList[i];

    return account;
  }
}

module.exports = { AccountRepository };
