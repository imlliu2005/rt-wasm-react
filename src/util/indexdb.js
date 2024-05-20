// indexdb 操作api封装

let db = null;
let storeName = 'dcmStore';
const openDB = async (dbName, dbVersion, storeName) => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            reject("Error opening database");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log("Database opened successfully");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            let store;
            if (!db.objectStoreNames.contains(storeName)) {
                store = db.createObjectStore(storeName, { keyPath: 'id' });
                // Define store schema here if needed
                console.log('Object store created:', store);
            }
            console.log('Object store open:', store);

        };
    });
};

// 创建 store
const createStore = (db, storeName) => {
    if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' });
        // Define store schema here if needed
        console.log('Object store created:', store);
    }
    console.log('Object store has exist!');
};


const deleteStore = (db, storeName) => {
    db.deleteStore(storeName);
    console.log('Delete store: ', storeName);
};

//写入数据库
const add = (db, id, data, storeName) => {
    const request = db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .add({ id, data });

    request.onsuccess = function (event) {
        console.log('Write Data Success!');
    };

    request.onerror = function (event) {
        console.log('Write Data failed!');
    }
};

// 读取数据
const read = (db, id, storeName) => {
    const transaction = db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(id);

    request.onerror = function (event) {
        console.log('Transaction failed!');
    };

    request.onsuccess = function (event) {
        if (request.result) {
            console.log('result ' + request.result.data);
        } else {
            console.log('No data records were obtained!');
        }
    };
};

// 删除数据
const remove = (db, id, storeName) => {
    var request = db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(id);

    request.onsuccess = function (event) {
        console.log('Data deletion succeeded!');
    };
}

// 更新数据
const update = (db, id, data, storeName) => {
    var request = db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put({ id, data });

    request.onsuccess = function (event) {
        console.log('Data update success!');
    };

    request.onerror = function (event) {
        console.log('Data update failure!');
    }
}

// 遍历全部数据
const readAll = (db, storeName) => {
    const objectStore = db.transaction(storeName).objectStore(storeName);

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            console.log('Id: ' + cursor.key);
            console.log('Value: ' + cursor.value.data);
            cursor.continue();
        } else {
            console.log('No more data!');
        }
    };
};

// 删除全部数据
const removeAll = (db, storeName) => {
    let store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const request = store.clear();
    request.onsuccess = (event) => {
        console.log('All data in ' + storeName + ' deleted!');
    }
};

// 删除数据库
const deleteDB = (dbName) => {
    //删除数据库
    const request = window.indexedDB.deleteDatabase(dbName);
    request.onerror = (event) => {
        console.error("Error deleting database.");
    };
    request.onsuccess = (event) => {
        console.log("Database deleted successfully");
    };

    console.log(dbName + 'Database deleted!')
};

// 关闭数据库
const closeDB = (db) => {
    //关闭数据库
    db.close();
    console.log('Database closed!')
};

// 数据库初始化
const init = async () => {
    db = await openDB('dcmdb', 3, 'dcmStore');
};

init();

export { db, storeName, add, read, readAll, update, remove, removeAll, openDB, closeDB, deleteDB, createStore, deleteStore };