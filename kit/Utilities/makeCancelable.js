export default (target = () => {}, options = {}) => {

    // valid options
    options = options || {};
    options.cancelable = options.cancelable || { isCanceled: true };
    options.onCanel = options.onCanel || (() => {});
    options.onResult = options.onResult || (() => { });
    options.pipe = options.pipe || (() => { });
    
    // cờ cancel
    let hasCanceled = false;
    let result = target;

    // hàm huỷ task
    let cancel = () => {

        hasCanceled = true;

        // gọi sự kiện hoàn tất
        options.pipe && options.pipe();

        // gọi sự kiện cancel
        options.onCanel && options.onCanel(options.cancelable);
    };
    
    // nếu đối tượng là function
    if (typeof target === "function") {

        // khởi tạo function task
        result = (...args) => {

            // gọi sự kiện hoàn tất
            options.pipe && options.pipe();

            // nếu task đã cancel 
            if (hasCanceled) {
                
                throw options.cancelable;
            }

            // nếu task chưa cancel
            // lấy kết quả và gọi sự kiện result
            let res = target(...args);
            options.onResult && options.onResult(res);
            return res;
        };
        
    } else if (target.then){ // nếu đối tượng là Promise

        // khởi tạo Promise task
        result = new Promise(async (resolve, reject) => {

           try {
               // chờ task xử lý
               const res = await target;

               // nếu task đã cancel
               if (hasCanceled) {

                   return reject(options.cancelable);
               }

               // gọi sự kiện hoàn tất
               options.pipe && options.pipe();

               // nếu task chưa cancel gọi sự kiện result
               options.onResult && options.onResult(res);
               return resolve(res);
           } catch (error) { // nếu task lỗi
               
               // nếu đã cancel
               if (hasCanceled) {
            
                   return reject(options.cancelable);
               }

               // gọi sự kiện hoàn tất
               options.pipe && options.pipe();

               // nếu task chưa cancel trả về lỗi
               return reject(error);
           } 
        });
    }

    // hàm cancel task
    result.cancel = cancel;

    return result;
};