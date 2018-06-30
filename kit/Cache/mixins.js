export default function () {

    this.isFile = () => {

        name = this.name || this.constructor.name;
        return (
            name == "FILE"
            || name == "File"
            || name == "FileCache"
        );
    };

    this.isLocalStore = () => {

        name = this.name || this.constructor.name;

        return (
            name == "LOCALSTORE"
            || name == "LocalStore"
            || name == "LocalStoreCache"
        );
    };

    this.isMemory = () => {

        name = this.name || this.constructor.name;

        return (
            name == "MEMORY"
            || name == "ARRAY"
            || name == "Memory"
            || name == "MemoryCache"
            || name == "Array"
        );
    };

    this.isArray = this.isMemory;
};