import makeCancelable from '../Utilities/makeCancelable';

/**
 * @todo class quản lý task
 */
class TaskManager {

    constructor(tasks = {}) {

        // tất cả các task
        this._tasks = tasks || {};
        this._taskID = -1;
    }

    /**
     * @todo hàm thêm task mới
     * @param function cancelHandle: sự kiện cancel task
     * @param function pipeHandle: sự kiện hoàn tất task
     */
    addTask = (task, cancelHandle, pipeHandle = false) => {

        let keepCancel = false;
        if (typeof pipeHandle == "boolean") {

            keepCancel = pipeHandle;
            pipeHandle = undefined;
        }

        // lấy mã task
        let taskID = this._taskID++;

        // khởi tạo cancel
        task = makeCancelable(task, { 

            // sự kiện task hoàn tất
            pipe: () => {

                // loại bỏ task trong task list
                delete this._tasks[taskID];
                pipeHandle && pipeHandle();
            },
            onCanel: cancelHandle
        });

        task.keepCancel = keepCancel;

        // thêm vào task list
        this._tasks[taskID] = task;
        
        return task;
    };

    /**
     * @todo hàm huỷ toàn bộ task
     */
    stopAllTasks = () => {

        for (let key in this._tasks) {
            if (this._tasks.hasOwnProperty(key)) {
                let task = this._tasks[key];
                if (task) {

                    if (task.keepCancel) {

                        return task.cancelled = true;
                    }

                    task.cancel && task.cancel();

                    delete this._tasks[key];
                }
                
            }
        }

        this._tasks = {};
    };

    /**
     * @todo hàm lấy toàn bộ task
     */
    getTasks = () => {

        return this._tasks;
    };

    /**
     * @todo hàm huỷ toàn bộ task
     */
    destroy = () => {

        this.stopAllTasks();
    };
}

export default TaskManager;