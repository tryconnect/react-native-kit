import React from 'react';
import ServiceProvider from '~/kit/Support/ServiceProvider';
import StringeeClient from '~/kit/VoiceCall/StringeeClient';
import StringeeCall from '~/kit/VoiceCall/StringeeCall';
import { refreshToken } from '~/services/calls/call';
import throttledPromise from '~/kit/Utilities/throttledPromise';
import StringeeProvider from './StringeeProvider';
import firebase from 'react-native-firebase';

const timeoutCache = 20000;
class StringeeServiceProvider extends ServiceProvider {

    async register() {

        this.isConnected = false;
        this.client = null;

        this.app.bind("stringeeClient", () => {

            const stringeeClient = new StringeeClient();
            stringeeClient.isConnected = () => {

                return this.isConnected;
            };
            stringeeClient.client = () => {

                return this.client;
            };

            return stringeeClient;
        });

        this.app.bind("stringeeCall", () => {

            return new StringeeCall();
        });

        this.app.alias("call", (callInfo = {}) => {

            if(!this.isConnected) {

                throw new Error("Client is disconnected");
            }
            if(typeof callInfo !== "object") {

                throw new Error("Caller information is incorrect");
            }

            if (!callInfo.to) {

                throw new Error("Caller information is incorrect");
            }
            app("events").emit("stringee.makeCall", {
                ...callInfo,
                from: callInfo.from || this.client.userId
            });
        });

        // Build a channel
        const channel = new firebase.notifications.Android.Channel(
                'fcm_default_channel', 
                'Test Channel', 
                firebase.notifications.Android.Importance.None
            )
            .setDescription('My apps test channel')
        ;

        // Create the channel
        firebase.notifications().android.createChannel(channel);

        // Build a channel group
        const channelGroup = new firebase.notifications.Android.ChannelGroup(
            'fcm_default_group', 
            'Test Channel Group'
        );

        // Create the channel group
        firebase.notifications().android.createChannelGroup(channelGroup);

        await firebase.messaging().requestPermission();
    }

    async boot() {

        const stringeeClient = app("stringeeClient");
        stringeeClient.addListener("onConnect", (e) => {

            this.client = e;
            this.isConnected = true;

            // firebase.messaging().getToken().then((token) => {

            //     stringeeClient.registerPush(token, false, true, (...args) => {

            //     });
            // });
        });

        stringeeClient.addListener("onDisConnect", (e) => {

            this.isConnected = false;
        });

        // khi đăng xuất thì tắt stringee
        auth.addListener(auth.EVENTS.LOGOUT, () => {

            if (stringeeClient.isConnected()) {

                stringeeClient.disconnect();
            }
        });

        const response = app("response");

        response.compileMiddleware((children) => {
            return (
                <StringeeProvider client={stringeeClient}>
                    {children}
                </StringeeProvider>
            );
        });

        // test
        if (!auth.check()) {

            try {
                
                await auth.attempt({
                    phone_number: `09655447${Math.floor((Math.random() * 99) + 10)}`
                }, true);
            } catch (error) {
                
            }
        }

        const user = auth.user();

        if (user) {

            await new Promise((resolve) => {

                this.app.getBootProgess().createStep("Stringee", async (updatePeriod) => {

                    try {
                        updatePeriod(0.1, {
                            description: "init cache"
                        });
                        const cache = await app('cacheManager').resolve("stringee");

                        let phoneNumber = user.phone_number;
                        let access_token = "";

                        updatePeriod(0.4, {
                            description: "checking token"
                        });
                        let hasToken = await cache.has("access_token");
                        if (hasToken) {

                            access_token = await cache.get(hasToken);
                        }

                        if (!access_token) {

                            updatePeriod(0.6, {
                                description: "refresh token"
                            });
                            access_token = await this.refreshToken(phoneNumber);
                        }

                        updatePeriod(0.8, {
                            description: "connecting"
                        });

                        await this.connect(stringeeClient, access_token, phoneNumber);

                        updatePeriod(0.9, {
                            description: "setting cache"
                        });
                        await cache.put("access_token", access_token);
                    } catch (error) { }

                    updatePeriod(1, {
                        description: "done"
                    });
                    resolve();
                }, {
                        description: "init"
                });
            });
        }
    }

    async refreshToken(phoneNumber) {

        const res = await refreshToken({
            mobile_phone: phoneNumber
        });
        if (
            res.status == 200
            && res.data
            && res.data.STATUS == "OK"
            && res.data.data
        ) {

            return res.data.data;
        }
    }

    async connect(client, access_token, phoneNumber) {

        try {

            return await throttledPromise(
                client.connect,
                3000
            )(access_token);
        } catch (error) {

            if (error.code >= 1 && error.code <= 7) {

                access_token = await this.refreshToken(phoneNumber);

                return await throttledPromise(
                    client.connect,
                    3000
                )(access_token);
            }
            throw error;
        }
    }
}

export default StringeeServiceProvider;