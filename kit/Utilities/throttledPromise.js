/**
 * @todo hàm hỗ trợ timeout cho async
 * @author Croco
 * @since 28-2-2018
 */
export default (handler, period = 0) => {

    return (...args) => {

        return new Promise( ( resolve, reject ) => {

            const waiting = handler(...args);

            waiting.then(result => resolve(result))
                   .catch(error => reject(error))
            ;

            if (period > 0) {

                let timeID = setTimeout(() => {
    
                    reject(new Error("Promise timeout"))
                }, period);
    
                waiting.finally( () => {
    
                    if(timeID) {
    
                        clearTimeout(timeID);
                    }
                    timeID = undefined;
                } );
            }
        } );
    };
};