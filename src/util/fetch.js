import mc from "./mc";
import { db, add, storeName } from './indexdb';
import { wasm } from "./load_wasm";
const accessKey = 'minio';
const secretKey = 'miniopwd';
const bucketName = 'my-sample-bucket';
let obj_list = null;

// 获取Bucket中的所有对象列表
const listObjects = async () => {
    // 获取存储桶中的所有对象信息
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
    return objectsList;
}

async function downloadObject(objectName) {
    const downloadURL = await mc.presignedGetObject(bucketName, objectName);
    // console.log('url -----> ', downloadURL);
    try {
        const response = await fetch(downloadURL, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${accessKey}:${secretKey}`).toString('base64')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download ${objectName}: ${response.statusText}`);
        } else {
            await new Promise((resolve, reject) => {
                response.blob().then(blob => {
                    add(db, objectName, blob, storeName);
                    console.log('blob size: ', blob.size);
                    return blob.arrayBuffer();
                }).then(buf => {
                    console.log('buf size: ', buf.byteLength);
                    if (wasm) {
                        wasm._process_blob(buf.byteLength, buf);
                    } else {
                        console.log('call wasm process error');
                    }
                    resolve();
                    wasm._process_blob(buf.byteLength, buf);
                }).catch(e => {
                    reject(e);
                    console.log('write indexdb failed ...', e);
                })
            });
        }
    } catch (error) {
        console.error(`Error downloading ${objectName}:`, error);
    }
}

async function downloadAllObjects() {
    try {
        const objects = await listObjects();
        obj_list = objects;
        const startTime = Date.now();
        await Promise.all(objects.map(obj => downloadObject(obj.name)));
        const endTime = Date.now();
        const downloadTime = (endTime - startTime) / 1000; // 转换为秒
        console.log(`Total download time: ${downloadTime} seconds`);
    } catch (error) {
        console.error('Error downloading objects:', error);
    }
}

export { downloadAllObjects, obj_list }