import LoadingTask from '~/library/LoadingTask';

export default (taskManager, persistor, pipi) => {

    try {
        // task restore redux state
        let taskRehydrate = new LoadingTask.Task(
            translate("tasks.rehydrate"),
            async (updatePeriod) => {

                
                try {
                    
                    let { bootstrapped } = persistor.getState();
                    if (bootstrapped) {

                        updatePeriod && updatePeriod(1, translate("tasks.rehydrate_done"));
                        return pipi && pipi();
                    }

                    let rehydrating = new Promise((resolve) => {

                        let unsubscribe;
                        unsubscribe = persistor.subscribe(() => {
                            
                            bootstrapped = persistor.getState().bootstrapped;

                            if (bootstrapped) {
                                unsubscribe && unsubscribe();
                                resolve();
                            }
                        });
                    });
                    await rehydrating;
                    
                    updatePeriod && updatePeriod(1, translate("tasks.rehydrate_done"));
                } catch (error) {
                    
                    updatePeriod && updatePeriod(1, translate("tasks.rehydrate_failed"));
                }

                pipi && pipi();
            },
            translate("tasks.rehydrating")
        );

        taskManager.addTask(taskRehydrate);
    } catch (error) {
        pipi && pipi();
    }
};