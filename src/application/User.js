import GenericUser from '~/kit/Auth/GenericUser';
class User extends GenericUser {

    getRememberTokenName() {

        return "access_token";
    }

    setRememberToken(token = null) {

        this.access_token = token;
    }

    getRememberToken() {

        return this.access_token;
    }

    getAuthIdentifier() {

        return this.account_id;
    }

    getAuthIdentifierName() {

        return "account_id";
    }
}

export default User;