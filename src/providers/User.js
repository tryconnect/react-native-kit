import ServiceProvider from '~/kit/Auth/UserProvider';
import User from '~/application/User';
import { login } from '~/services/member/users';

class UserServiceProvider extends ServiceProvider {

    retrieveById(identifier) {

        return null;
    }

    async retrieveByToken(identifier, token) {

        try {
            const res = await login(token);
            const user = this.getUserFromRes(res);
            return user;
        } catch (error) {
            
            return null;
        }
    }

    updateRememberToken(user, token) {

        user.setRememberToken(token);
    }

    async retrieveByCredentials(credentials = {}) {

        try {
            const res = await login(credentials);
            const user = this.getUserFromRes(res);
            return user;
        } catch (error) {

            return null;
        }
    }

    validateCredentials(user, credentials = {}) {

        return user instanceof User;
    }

    getUserFromRes(res) {
        if (res.status == 200 && res.data && res.data.STATUS == "OK") {

            const user = new User(res.data.data);
            const authorization = res.headers["authorization"];
            if (authorization) {

                const token = authorization.split(" ")[1];
                user.setRememberToken(token);
            }

            return user;
        }
        return null;
    }

    getGenericUser(user) {
        if (
            user &&
            !(user instanceof User)
            && typeof user === "object"
        ) {

            user = new User(user);
        }

        return user;
    }
}

export default UserServiceProvider;