import * as minio from "minio";

const mc = new minio.Client(
    {
        endPoint: "192.168.110.199",
        useSSL: false,
        port: 9000,
        accessKey: "minio",
        secretKey: "miniopwd"
    },
);

export default mc