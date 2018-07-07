class GenericUser {

    constructor(data = {}) {

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    getRememberTokenName() {

        return "rememberToken";
    }

    setRememberToken(token = null) {

        this.rememberToken = token;
    }

    getRememberToken() {

        return this.rememberToken;
    }

    getAuthIdentifier() {

        return this.id;
    }

    getAuthIdentifierName() {

        return "id";
    }
}

export default GenericUser;