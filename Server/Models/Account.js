class Account {
    constructor(firstName, lastName, userName, email, hashedPassword, isAdmin) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.hashedPassword = hashedPassword;
        this.isAdmin = isAdmin;
        this.currentPrivateCode = "";
    }
}

module.exports = { Account };