import mc from "./mc";
import { db, add, storeName } from './indexdb';

// 下载存储桶中所有对象并测量时间
const bucketName = 'my-sample-bucket';

// 查询 buckets
const getBucket = async () => {
    try {
        const buckets = await mc.listBuckets()
        console.log('Success', buckets)
        const bucketName = buckets[0].name;
    } catch (err) {
        console.log(err.message)
    }
};

// 获取Bucket中的所有对象列表
const listObjects = async () => {
    const objectsList = [];
    await new Promise((resolve, reject) => {
        mc.listObjects(bucketName, '', true)
            .on('data', function (obj) {
                objectsList.push(obj);
                resolve(obj);
            })
            .on('error', function (err) {
                reject(err);
            });
    });
    // console.log('objectslist -----> ', objectsList);
    return objectsList;
};

// 下载存储桶中所有对象并测量时间的函数
const downloadAllObjectsAndMeasureTime = async (bucketName) => {
    const startTime = Date.now();
    const objectsList = await listObjects();
    // 遍历下载所有对象
    await Promise.all(objectsList.map(async (obj) => {
        const objectName = obj.name;
        let chunks = [];
        let blob;
        await new Promise((resolve, reject) => {
            // 使用 getObject() 方法从 MinIO 获取对象流，并将其写入到 blob 中
            mc.getObject(bucketName, objectName, (err, dataStream) => {
                if (err) {
                    reject(err);
                }
                // 将数据流 pipe 到可写流中
                dataStream.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                dataStream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    blob = new Blob([buffer], { type: 'binary/octet-stream' });
                    // 存储到indexdb
                    add(db, objectName, blob, storeName);
                    resolve();
                });

                dataStream.on('error', (err) => {
                    console.log(err);
                });
            });
        });

    }));

    // 获取下载完成后的时间
    const endTime = Date.now();
    // 计算下载时间
    const downloadTime = (endTime - startTime) / 1000; // 转换为秒
    console.log(`Downloaded all objects from bucket '${bucketName}' in ${downloadTime} seconds`);
}

const downloadData = async () => {
    downloadAllObjectsAndMeasureTime(bucketName).catch(err => {
        console.error('Error downloading objects:', err);
    });
}

// 下载所用数据并计算时间
export { downloadData }



